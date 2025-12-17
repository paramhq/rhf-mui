import { useState } from 'react';
import { z } from 'zod';
import {
  Paper,
  Typography,
  Button,
  Grid,
  Divider,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import {
  Form,
  RHFTextField,
  RHFNumberField,
  RHFSelect,
  RHFDatePicker,
  RHFCheckbox,
  RHFSwitch,
  RHFAmountField,
  RHFAadhaarField,
  RHFPanField,
  RHFMobileField,
  RHFPincodeField,
  RHFFieldArray,
  RHFTextArea,
  validatePanFormat,
} from '@paramhq/forms';

const memberSchema = z.object({
  // Personal Details
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  dateOfBirth: z.any().refine((val) => val !== null, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),

  // Contact Details
  email: z.email({ error: 'Invalid email' }),
  mobile: z.string().length(10, 'Mobile must be 10 digits'),
  address: z.string().min(10, 'Address is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),

  // Identity Documents
  aadhaar: z.string().length(12, 'Aadhaar must be 12 digits'),
  pan: z
    .string()
    .length(10, 'PAN must be 10 characters')
    .refine(validatePanFormat, 'Invalid PAN format'),

  // Financial Details
  occupation: z.string().min(1, 'Occupation is required'),
  annualIncome: z.number().min(0, 'Annual income is required'),

  // Nominees
  nominees: z
    .array(
      z.object({
        name: z.string().min(2, 'Name is required'),
        relation: z.string().min(1, 'Relation is required'),
        percentage: z.number().min(1).max(100),
      })
    )
    .min(1, 'At least one nominee is required'),

  // Additional
  remarks: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  receiveUpdates: z.boolean().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

const occupationOptions = [
  { value: 'salaried', label: 'Salaried Employee' },
  { value: 'self-employed', label: 'Self Employed' },
  { value: 'business', label: 'Business Owner' },
  { value: 'retired', label: 'Retired' },
  { value: 'student', label: 'Student' },
  { value: 'homemaker', label: 'Homemaker' },
];

const relationOptions = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
];

const steps = ['Personal Details', 'Contact Info', 'Identity & Finance', 'Nominees & Submit'];

export function CompleteFormDemo() {
  const [activeStep, setActiveStep] = useState(0);
  const [submittedData, setSubmittedData] = useState<MemberFormData | null>(null);

  const handleSubmit = (data: MemberFormData) => {
    console.log('Form submitted:', data);
    setSubmittedData(data);
  };

  const handleNext = () => {
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  if (submittedData) {
    return (
      <Paper sx={{ p: 3 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Member registration submitted successfully!
        </Alert>
        <Typography variant="h6" gutterBottom>
          Submitted Data:
        </Typography>
        <Box
          component="pre"
          sx={{
            p: 2,
            bgcolor: 'grey.100',
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem',
          }}
        >
          {JSON.stringify(submittedData, null, 2)}
        </Box>
        <Button
          variant="contained"
          onClick={() => setSubmittedData(null)}
          sx={{ mt: 2 }}
        >
          Submit Another
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Complete Member Registration Form
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        A comprehensive form demonstrating all components working together in a real-world
        scenario.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ my: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={memberSchema}
        defaultValues={{
          firstName: '',
          lastName: '',
          dateOfBirth: null,
          gender: '',
          email: '',
          mobile: '',
          address: '',
          pincode: '',
          aadhaar: '',
          pan: '',
          occupation: '',
          annualIncome: 0,
          nominees: [{ name: '', relation: '', percentage: 100 }],
          remarks: '',
          acceptTerms: false,
          receiveUpdates: true,
        }}
        onSubmit={handleSubmit}
      >
        {/* Step 0: Personal Details */}
        <Box sx={{ display: activeStep === 0 ? 'block' : 'none' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="firstName" label="First Name" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="lastName" label="Last Name" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFDatePicker
                name="dateOfBirth"
                label="Date of Birth"
                disableFuture
                openTo="year"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFSelect name="gender" label="Gender" options={genderOptions} />
            </Grid>
          </Grid>
        </Box>

        {/* Step 1: Contact Info */}
        <Box sx={{ display: activeStep === 1 ? 'block' : 'none' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFTextField name="email" label="Email Address" type="email" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFMobileField name="mobile" label="Mobile Number" showCountryCode />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <RHFTextArea name="address" label="Full Address" minRows={2} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFPincodeField name="pincode" label="Pincode" />
            </Grid>
          </Grid>
        </Box>

        {/* Step 2: Identity & Finance */}
        <Box sx={{ display: activeStep === 2 ? 'block' : 'none' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFAadhaarField name="aadhaar" label="Aadhaar Number" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFPanField name="pan" label="PAN Number" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFSelect name="occupation" label="Occupation" options={occupationOptions} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFAmountField name="annualIncome" label="Annual Income" />
            </Grid>
          </Grid>
        </Box>

        {/* Step 3: Nominees & Submit */}
        <Box sx={{ display: activeStep === 3 ? 'block' : 'none' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" gutterBottom>
                Nominees (Total percentage must equal 100%)
              </Typography>
              <RHFFieldArray
                name="nominees"
                defaultValue={{ name: '', relation: '', percentage: 0 }}
                minItems={1}
                maxItems={4}
                variant="card"
                addButtonText="Add Nominee"
              >
                {({ namePrefix }) => (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <RHFTextField name={`${namePrefix}.name`} label="Nominee Name" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <RHFSelect
                        name={`${namePrefix}.relation`}
                        label="Relation"
                        options={relationOptions}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <RHFNumberField
                        name={`${namePrefix}.percentage`}
                        label="Share %"
                        min={1}
                        max={100}
                      />
                    </Grid>
                  </Grid>
                )}
              </RHFFieldArray>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <RHFTextArea
                name="remarks"
                label="Remarks (Optional)"
                minRows={2}
                placeholder="Any additional information..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <RHFSwitch name="receiveUpdates" label="Receive updates via SMS/Email" />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <RHFCheckbox
                name="acceptTerms"
                label="I hereby declare that all information provided is true and accurate"
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 3 }}>
          <Button disabled={activeStep === 0} onClick={handleBack} variant="outlined">
            Back
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep < steps.length - 1 ? (
              <Button onClick={handleNext} variant="contained">
                Next
              </Button>
            ) : (
              <Button type="submit" variant="contained" color="success">
                Submit Registration
              </Button>
            )}
          </Box>
        </Box>
      </Form>
    </Paper>
  );
}
