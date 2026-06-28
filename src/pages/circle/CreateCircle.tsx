import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { apiCreateCircle, apiAddMember } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import Stepper from '../../components/ui/Stepper'
import Button from '../../components/ui/Button'
import { ArrowLeftIcon, ArrowRightIcon } from '../../components/ui/Icons'
import Step1Plan from './steps/Step1Plan'
import Step2Details from './steps/Step2Details'
import Step3Members from './steps/Step3Members'
import Step4Review from './steps/Step4Review'
import type { CreateCircleFormData, Member } from '../../types'

const STEPS = ['Choose plan', 'Circle details', 'Add members', 'Review']

const DEFAULT_FORM: CreateCircleFormData = {
  plan: null,
  name: '',
  contribution: '',
  frequency: 'Monthly',
  maxMembers: '',
  startDate: '',
  payoutOrder: 'Sequential',
  description: '',
}

export default function CreateCircle() {
  const { user, accessToken } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<CreateCircleFormData>(DEFAULT_FORM)
  const [members, setMembers] = useState<Member[]>([])
  const navigate = useNavigate()

  const createMutation = useMutation({
    mutationFn: () => user && accessToken ? apiCreateCircle(form, user.id, accessToken) : Promise.reject('No auth token'),
    onSuccess: async (c) => {
      // persist staged members to backend
      if (members.length > 0 && accessToken) {
        try {
          await Promise.all(members.map(m => apiAddMember(c.id, { name: m.name, phone: m.phone ?? '', email: m.email }, accessToken)))
        } catch (err) {
          // swallow for now; optionally surface toast
          console.error('Failed to add members after circle creation', err)
        }
      }
      navigate(`/circle/${c.id}/members`)
    },
  })

  const updateForm = (patch: Partial<CreateCircleFormData>) => {
    setForm(prev => ({ ...prev, ...patch }))
  }

  const canNext = () => {
    if (step === 1) return form.plan !== null
    if (step === 2) return !!(form.name && form.contribution && form.maxMembers && form.startDate)
    if (step === 3) return true
    return true
  }

  const handleNext = () => {
    if (step < 4) setStep(s => s + 1)
    else createMutation.mutate()
  }

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1)
    else navigate('/overview')
  }

  return (
    <div className="p-6 max-w-[820px] mx-auto">
      {/* Stepper */}
      <div className="mb-7">
        <Stepper steps={STEPS} current={step} />
      </div>

      {/* Step content */}
      <div className="bg-surface rounded-2xl border border-border p-6 mb-5 min-h-[400px]">
        {step === 1 && (
          <Step1Plan
            selected={form.plan}
            onSelect={plan => updateForm({ plan })}
          />
        )}
        {step === 2 && (
          <Step2Details data={form} onChange={updateForm} />
        )}
        {step === 3 && (
          <Step3Members
            circleData={form}
            members={members}
            onAddMember={m => setMembers(prev => [...prev, m])}
          />
        )}
        {step === 4 && (
          <Step4Review data={form} members={members} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          icon={<ArrowLeftIcon className="w-4 h-4" />}
          onClick={handleBack}
        >
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        <div className="flex items-center gap-2">
          {step === 3 && members.length === 0 && (
            <Button variant="ghost" onClick={() => setStep(4)}>
              Add members later
            </Button>
          )}
          <Button
            variant="primary"
            iconRight={step < 4 ? <ArrowRightIcon className="w-4 h-4" /> : undefined}
            onClick={handleNext}
            disabled={!canNext()}
            loading={createMutation.isPending}
          >
            {step === 4 ? 'Launch circle' : step === 3 ? 'Review & launch' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}
