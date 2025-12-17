import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { RHFFieldArray } from './rhf-field-array';
import { RHFTextField, RHFNumberField } from './rhf-text-field';
import { RHFSelect } from './rhf-select'; // Assume exists
import { RHFDatePicker } from './rhf-date-picker'; // Assume exists
import { RHFCheckbox } from './rhf-checkbox'; // Assume exists

// =============================================================================
// Example 1: Nominees (Cooperative Accounts)
// =============================================================================

const nomineeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  percentage: z.number().min(1).max(100),
  isMinor: z.boolean(),
  guardianName: z.string().optional(),
  aadhaar: z.string().length(12, 'Aadhaar must be 12 digits').optional(),
});

const accountSchema = z.object({
  accountType: z.string().min(1),
  nominees: z
    .array(nomineeSchema)
    .min(1, 'At least one nominee is required')
    .max(4, 'Maximum 4 nominees allowed')
    .refine(
      (nominees) => {
        const total = nominees.reduce((sum, n) => sum + n.percentage, 0);
        return total === 100;
      },
      { message: 'Nominee percentages must total 100%' }
    ),
});

type AccountFormData = z.infer<typeof accountSchema>;

const relationOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'father', label: 'Father' },
  { value: 'mother', label: 'Mother' },
  { value: 'brother', label: 'Brother' },
  { value: 'sister', label: 'Sister' },
  { value: 'other', label: 'Other' },
];

export function NomineeFieldArrayExample() {
  const methods = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      accountType: 'savings',
      nominees: [{ name: '', relation: '', percentage: 100, isMinor: false }],
    },
    mode: 'onBlur',
  });

  const { control, handleSubmit, watch, formState: { errors } } = methods;
  const nominees = watch('nominees');
  const totalPercentage = nominees?.reduce((sum, n) => sum + (n.percentage || 0), 0) ?? 0;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(console.log)}>
        <Stack spacing={3} maxWidth={600}>
          <Typography variant="h6">Account Nominees</Typography>

          {/* Percentage indicator */}
          <Alert severity={totalPercentage === 100 ? 'success' : 'warning'}>
            Total allocation: {totalPercentage}% {totalPercentage !== 100 && '(must be 100%)'}
          </Alert>

          <RHFFieldArray<AccountFormData, 'nominees'>
            name="nominees"
            control={control}
            defaultValue={{ name: '', relation: '', percentage: 0, isMinor: false }}
            minItems={1}
            maxItems={4}
            title="Nominees"
            addButtonText="Add Nominee"
            variant="card"
          >
            {({ index, namePrefix, isFirst }) => {
              const isMinor = watch(`${namePrefix}.isMinor`);
              
              return (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFTextField
                      name={`${namePrefix}.name`}
                      control={control}
                      label="Full Name"
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RHFSelect
                      name={`${namePrefix}.relation`}
                      control={control}
                      options={relationOptions}
                      label="Relation"
                      required
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <RHFNumberField
                      name={`${namePrefix}.percentage`}
                      control={control}
                      label="Share %"
                      required
                      fullWidth
                      slotProps={{
                        htmlInput: { min: 1, max: 100 }
                      }}
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 4 }}>
                    <RHFCheckbox
                      name={`${namePrefix}.isMinor`}
                      control={control}
                      label="Minor (below 18)"
                    />
                  </Grid>

                  {isMinor && (
                    <Grid size={{ xs: 12 }}>
                      <RHFTextField
                        name={`${namePrefix}.guardianName`}
                        control={control}
                        label="Guardian Name"
                        required
                        fullWidth
                        helperText="Required for minor nominees"
                      />
                    </Grid>
                  )}

                  <Grid size={{ xs: 12, sm: 8 }}>
                    <RHFTextField
                      name={`${namePrefix}.aadhaar`}
                      control={control}
                      label="Aadhaar (Optional)"
                      fullWidth
                    />
                  </Grid>
                </Grid>
              );
            }}
          </RHFFieldArray>

          {/* Root-level array error */}
          {errors.nominees?.root && (
            <Alert severity="error">{errors.nominees.root.message}</Alert>
          )}

          <Button type="submit" variant="contained" size="large">
            Save Nominees
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}

// =============================================================================
// Example 2: Loan Guarantors
// =============================================================================

const guarantorSchema = z.object({
  memberId: z.number({ invalid_type_error: 'Select a member' }),
  memberName: z.string(), // Display only
  guaranteeAmount: z.number().min(1000, 'Minimum ₹1,000'),
  relation: z.string().min(1, 'Relation is required'),
});

const loanSchema = z.object({
  loanAmount: z.number().min(10000),
  guarantors: z
    .array(guarantorSchema)
    .min(1, 'At least one guarantor is required')
    .max(3, 'Maximum 3 guarantors')
    .refine(
      (guarantors) => {
        const uniqueMembers = new Set(guarantors.map((g) => g.memberId));
        return uniqueMembers.size === guarantors.length;
      },
      { message: 'Same member cannot be guarantor twice' }
    ),
});

type LoanFormData = z.infer<typeof loanSchema>;

export function GuarantorFieldArrayExample() {
  const methods = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: {
      loanAmount: 50000,
      guarantors: [],
    },
  });

  const { control, handleSubmit, watch, setValue, formState: { errors } } = methods;
  const loanAmount = watch('loanAmount');

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(console.log)}>
        <Stack spacing={3} maxWidth={600}>
          <Typography variant="h6">Loan Guarantors</Typography>

          <RHFNumberField
            name="loanAmount"
            control={control}
            label="Loan Amount"
            required
          />

          <RHFFieldArray<LoanFormData, 'guarantors'>
            name="guarantors"
            control={control}
            defaultValue={{ 
              memberId: null as any, 
              memberName: '', 
              guaranteeAmount: Math.round(loanAmount / 2),
              relation: '' 
            }}
            minItems={1}
            maxItems={3}
            title="Guarantors"
            addButtonText="Add Guarantor"
            variant="card"
            reorderable
          >
            {({ index, namePrefix }) => (
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  {/* Use RHFAsyncAutocomplete for member search */}
                  <RHFTextField
                    name={`${namePrefix}.memberName`}
                    control={control}
                    label="Member"
                    placeholder="Search member..."
                    required
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <RHFNumberField
                    name={`${namePrefix}.guaranteeAmount`}
                    control={control}
                    label="Guarantee Amount (₹)"
                    required
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <RHFSelect
                    name={`${namePrefix}.relation`}
                    control={control}
                    options={relationOptions}
                    label="Relation to Applicant"
                    required
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}
          </RHFFieldArray>

          {errors.guarantors?.root && (
            <Alert severity="error">{errors.guarantors.root.message}</Alert>
          )}

          <Button type="submit" variant="contained">
            Submit Application
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}

// =============================================================================
// Example 3: Custom EMI Schedule (Irregular Installments)
// =============================================================================

const installmentSchema = z.object({
  dueDate: z.date(),
  principal: z.number().min(0),
  interest: z.number().min(0),
  emi: z.number().min(1),
});

const customScheduleSchema = z.object({
  loanId: z.number(),
  installments: z
    .array(installmentSchema)
    .min(1, 'At least one installment required'),
});

type CustomScheduleFormData = z.infer<typeof customScheduleSchema>;

export function InstallmentScheduleExample() {
  const methods = useForm<CustomScheduleFormData>({
    resolver: zodResolver(customScheduleSchema),
    defaultValues: {
      loanId: 1,
      installments: [
        { dueDate: new Date(), principal: 8000, interest: 2000, emi: 10000 },
      ],
    },
  });

  const { control, handleSubmit, watch } = methods;
  const installments = watch('installments');

  const totals = React.useMemo(() => ({
    principal: installments?.reduce((sum, i) => sum + (i.principal || 0), 0) ?? 0,
    interest: installments?.reduce((sum, i) => sum + (i.interest || 0), 0) ?? 0,
    emi: installments?.reduce((sum, i) => sum + (i.emi || 0), 0) ?? 0,
  }), [installments]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(console.log)}>
        <Stack spacing={3} maxWidth={700}>
          <Typography variant="h6">Custom EMI Schedule</Typography>

          <RHFFieldArray<CustomScheduleFormData, 'installments'>
            name="installments"
            control={control}
            defaultValue={{ 
              dueDate: new Date(), 
              principal: 0, 
              interest: 0, 
              emi: 0 
            }}
            minItems={1}
            title="Installments"
            addButtonText="Add Installment"
            variant="compact"
            reorderable
          >
            {({ index, namePrefix }) => (
              <Grid container spacing={1} alignItems="center">
                <Grid size={{ xs: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    #{index + 1}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 3 }}>
                  <RHFDatePicker
                    name={`${namePrefix}.dueDate`}
                    control={control}
                    label="Due Date"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 2.5 }}>
                  <RHFNumberField
                    name={`${namePrefix}.principal`}
                    control={control}
                    label="Principal"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 2.5 }}>
                  <RHFNumberField
                    name={`${namePrefix}.interest`}
                    control={control}
                    label="Interest"
                    size="small"
                  />
                </Grid>

                <Grid size={{ xs: 2.5 }}>
                  <RHFNumberField
                    name={`${namePrefix}.emi`}
                    control={control}
                    label="EMI"
                    size="small"
                  />
                </Grid>
              </Grid>
            )}
          </RHFFieldArray>

          {/* Totals row */}
          <Box sx={{ bgcolor: 'action.hover', p: 2, borderRadius: 1 }}>
            <Grid container spacing={1}>
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2">
                  Total Principal: <strong>₹{totals.principal.toLocaleString('en-IN')}</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2">
                  Total Interest: <strong>₹{totals.interest.toLocaleString('en-IN')}</strong>
                </Typography>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Typography variant="body2">
                  Total EMI: <strong>₹{totals.emi.toLocaleString('en-IN')}</strong>
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Button type="submit" variant="contained">
            Save Schedule
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}

// =============================================================================
// Example 4: Document Checklist
// =============================================================================

const documentSchema = z.object({
  type: z.string().min(1),
  file: z.instanceof(File).optional(),
  verified: z.boolean(),
  remarks: z.string().optional(),
});

const kycSchema = z.object({
  memberId: z.number(),
  documents: z.array(documentSchema).min(1),
});

type KycFormData = z.infer<typeof kycSchema>;

const documentTypes = [
  { value: 'aadhaar', label: 'Aadhaar Card' },
  { value: 'pan', label: 'PAN Card' },
  { value: 'photo', label: 'Passport Photo' },
  { value: 'address', label: 'Address Proof' },
  { value: 'income', label: 'Income Proof' },
  { value: 'bank', label: 'Bank Statement' },
];

export function DocumentChecklistExample() {
  const methods = useForm<KycFormData>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      memberId: 1,
      documents: documentTypes.map((d) => ({
        type: d.value,
        verified: false,
        remarks: '',
      })),
    },
  });

  const { control, handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(console.log)}>
        <Stack spacing={3} maxWidth={600}>
          <Typography variant="h6">KYC Document Checklist</Typography>

          <RHFFieldArray<KycFormData, 'documents'>
            name="documents"
            control={control}
            defaultValue={{ type: '', verified: false, remarks: '' }}
            title="Required Documents"
            addButtonText="Add Document"
            variant="default"
          >
            {({ index, namePrefix }) => (
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RHFSelect
                    name={`${namePrefix}.type`}
                    control={control}
                    options={documentTypes}
                    label="Document Type"
                    size="small"
                    fullWidth
                  />
                </Grid>

                <Grid size={{ xs: 6, sm: 3 }}>
                  <RHFCheckbox
                    name={`${namePrefix}.verified`}
                    control={control}
                    label="Verified"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 5 }}>
                  <RHFTextField
                    name={`${namePrefix}.remarks`}
                    control={control}
                    label="Remarks"
                    size="small"
                    fullWidth
                  />
                </Grid>
              </Grid>
            )}
          </RHFFieldArray>

          <Button type="submit" variant="contained">
            Save KYC
          </Button>
        </Stack>
      </form>
    </FormProvider>
  );
}
