export interface BankOption {
  code: string
  label: string
}

// NIBSS institution codes for commonly used Nigerian banks/fintechs.
export const NIGERIAN_BANKS: BankOption[] = [
  { code: '044', label: 'Access Bank' },
  { code: '063', label: 'Access Bank (Diamond)' },
  { code: '023', label: 'Citibank Nigeria' },
  { code: '050', label: 'Ecobank Nigeria' },
  { code: '070', label: 'Fidelity Bank' },
  { code: '011', label: 'First Bank of Nigeria' },
  { code: '214', label: 'First City Monument Bank (FCMB)' },
  { code: '058', label: 'Guaranty Trust Bank (GTBank)' },
  { code: '030', label: 'Heritage Bank' },
  { code: '301', label: 'Jaiz Bank' },
  { code: '082', label: 'Keystone Bank' },
  { code: '090267', label: 'Kuda Bank' },
  { code: '526', label: 'Parallex Bank' },
  { code: '076', label: 'Polaris Bank' },
  { code: '101', label: 'Providus Bank' },
  { code: '221', label: 'Stanbic IBTC Bank' },
  { code: '068', label: 'Standard Chartered Bank' },
  { code: '232', label: 'Sterling Bank' },
  { code: '100', label: 'SunTrust Bank' },
  { code: '032', label: 'Union Bank of Nigeria' },
  { code: '033', label: 'United Bank for Africa (UBA)' },
  { code: '215', label: 'Unity Bank' },
  { code: '035', label: 'Wema Bank' },
  { code: '057', label: 'Zenith Bank' },
  { code: '999992', label: 'OPay' },
  { code: '999991', label: 'PalmPay' },
  { code: '50515', label: 'Moniepoint MFB' },
]
