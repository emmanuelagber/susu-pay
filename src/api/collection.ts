import { apiGet, apiPost } from './_client'
import type {
  CollectionAccount,
  CollectionActionResult,
  DisburseRequest,
  MemberAccount,
} from '../types/sprint2'

// Only the request bodies of the Collections endpoints are documented in Swagger,
// so responses are read defensively: each field tries the likely backend names.

type Raw = Record<string, unknown>

function pick<T>(item: Raw, ...keys: string[]): T | undefined {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) return item[key] as T
  }
  return undefined
}

function asList(data: unknown): Raw[] {
  if (Array.isArray(data)) return data as Raw[]
  const obj = (data ?? {}) as Raw
  for (const key of ['items', 'accounts', 'members', 'collectionAccounts', 'memberAccounts']) {
    if (Array.isArray(obj[key])) return obj[key] as Raw[]
  }
  return []
}

function initialsFromName(name: string): string {
  const parts = name.split(' ').filter(Boolean)
  return parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('') || 'U'
}

function toCollectionAccount(item: Raw): CollectionAccount {
  const status = String(pick(item, 'status') ?? '').toLowerCase()
  return {
    id: String(pick(item, 'id', 'collectionAccountId', 'accountNumber') ?? ''),
    accountNumber: String(pick(item, 'accountNumber', 'virtualAccountNumber', 'bankAccountNumber') ?? ''),
    accountName: pick(item, 'accountName', 'bankAccountName', 'name'),
    bankName: pick(item, 'bankName', 'bank'),
    balance: Number(pick(item, 'balance', 'currentBalance', 'availableBalance', 'ledgerBalance') ?? 0),
    isActive: pick<boolean>(item, 'isActive', 'active') ?? (status ? status === 'active' : true),
    createdAt: pick(item, 'createdAt', 'dateCreated'),
  }
}

function toMemberAccount(item: Raw): MemberAccount {
  const name = String(pick(item, 'memberName', 'name', 'fullName') ?? 'Unknown')
  const payoutAccountNumber = pick<string>(item, 'payoutAccountNumber', 'bankAccountNumber')
  const payout = (pick<Raw>(item, 'payoutAccount') ?? {}) as Raw
  const nestedPayoutNumber = pick<string>(payout, 'accountNumber')
  return {
    memberId: String(pick(item, 'memberId', 'id') ?? ''),
    name,
    initials: initialsFromName(name),
    payoutPosition: Number(pick(item, 'payoutPosition', 'position') ?? 0),
    virtualAccountNumber: String(pick(item, 'virtualAccountNumber', 'accountNumber') ?? ''),
    virtualAccountBank: pick(item, 'virtualAccountBankName', 'bankName'),
    payoutAccountNumber: payoutAccountNumber ?? nestedPayoutNumber,
    payoutBankName: pick(item, 'payoutBankName', 'payoutBankLabel') ?? pick(payout, 'bankLabel', 'bankName'),
    payoutReady: Boolean(
      pick(item, 'payoutReady', 'isPayoutReady', 'hasVerifiedPayoutAccount', 'payoutAccountVerified', 'hasPayoutAccount')
        ?? (payoutAccountNumber ?? nestedPayoutNumber),
    ),
    isActive: pick<boolean>(item, 'isActive') ?? true,
  }
}

function toActionResult(data: unknown): CollectionActionResult {
  const obj = (data && typeof data === 'object' ? data : {}) as Raw
  const amount = pick<number>(obj, 'totalAmount', 'amount', 'amountSwept', 'sweptAmount', 'totalSwept', 'amountDisbursed')
  const count = pick<number>(obj, 'count', 'contributionCount', 'sweptCount', 'contributionsSwept')
  return {
    message: pick(obj, 'message'),
    amount: amount !== undefined ? Number(amount) : undefined,
    count: count !== undefined ? Number(count) : undefined,
    reference: pick(obj, 'reference', 'transactionReference', 'transferReference'),
    raw: data,
  }
}

export async function getCollectionAccounts(
  circleId: string,
  token: string,
  includeInactive = false,
): Promise<CollectionAccount[]> {
  const q = includeInactive ? '?includeInactive=true' : ''
  const data = await apiGet<unknown>(`/circles/${circleId}/collection-accounts${q}`, token)
  return asList(data).map(toCollectionAccount)
}

export async function getMemberAccounts(circleId: string, token: string): Promise<MemberAccount[]> {
  const data = await apiGet<unknown>(`/circles/${circleId}/member-accounts`, token)
  return asList(data)
    .map(toMemberAccount)
    .sort((a, b) => a.payoutPosition - b.payoutPosition)
}

/** Credits the circle's collection account with every reconciled-but-unpooled contribution. */
export async function sweepCollection(circleId: string, token: string): Promise<CollectionActionResult> {
  const data = await apiPost<unknown>(`/circles/${circleId}/collection/sweep`, {}, token)
  return toActionResult(data)
}

/** Debits the circle's collection account and transfers to the member's verified payout account. */
export async function disburseCollection(
  circleId: string,
  body: DisburseRequest,
  token: string,
): Promise<CollectionActionResult> {
  const data = await apiPost<unknown>(`/circles/${circleId}/collection/disburse`, body, token)
  return toActionResult(data)
}
