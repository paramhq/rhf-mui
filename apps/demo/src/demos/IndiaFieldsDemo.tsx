import { useState } from 'react';
import { z } from 'zod';
import { Paper, Typography, Button, Grid2 as Grid, Divider, Box, Alert } from '@mui/material';
import {
  Form,
  RHFAmountField,
  RHFAadhaarField,
  RHFPanField,
  RHFMobileField,
  RHFIfscField,
  RHFPincodeField,
  RHFGstField,
  validatePanFormat,
  validateAadhaarChecksum,
} from '@rhf-mui/core';

const indiaSchema = z.object({
  loanAmount: z.number().min(10000, 'Minimum loan amount is Rs. 10,000'),
  aadhaar: z
    .string()
    .length(12, 'Aadhaar must be 12 digits')
    .refine(validateAadhaarChecksum, 'Invalid Aadhaar number'),
  pan: z
    .string()
    .length(10, 'PAN must be 10 characters')
    .refine(validatePanFormat, 'Invalid PAN format'),
  mobile: z.string().length(10, 'Mobile must be 10 digits'),
  ifsc: z.string().length(11, 'IFSC must be 11 characters').optional(),
  pincode: z.string().length(6, 'Pincode must be 6 digits').optional(),
  gst: z.string().length(15, 'GST must be 15 characters').optional(),
});

type IndiaFormData = z.infer<typeof indiaSchema>;

export function IndiaFieldsDemo() {
  const [bankDetails, setBankDetails] = useState<{ bank: string; branch: string } | null>(null);
  const [locationDetails, setLocationDetails] = useState<{
    city: string;
    state: string;
    district: string;
  } | null>(null);

  const handleSubmit = (data: IndiaFormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        India-Specific Fields
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates specialized fields for Indian data: Amount (with Indian currency formatting),
        Aadhaar, PAN, Mobile, IFSC, Pincode, and GST fields.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={indiaSchema}
        defaultValues={{
          loanAmount: 100000,
          aadhaar: '',
          pan: '',
          mobile: '',
          ifsc: '',
          pincode: '',
          gst: '',
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Financial Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFAmountField
              name="loanAmount"
              label="Loan Amount"
              helperText="Enter amount in Indian Rupees"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFGstField name="gst" label="GST Number (GSTIN)" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Identity Documents
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFAadhaarField name="aadhaar" label="Aadhaar Number" masked />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFPanField name="pan" label="PAN Number" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact & Banking
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFMobileField name="mobile" label="Mobile Number" showCountryCode />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFIfscField name="ifsc" label="Bank IFSC Code" onBankDetails={setBankDetails} />
          </Grid>

          {bankDetails && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="success">
                Bank: {bankDetails.bank} | Branch: {bankDetails.branch}
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFPincodeField name="pincode" label="Pincode" onLocationDetails={setLocationDetails} />
          </Grid>

          {locationDetails && (
            <Grid size={{ xs: 12, sm: 6 }}>
              <Alert severity="info">
                {locationDetails.city}, {locationDetails.district}, {locationDetails.state}
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button type="reset" variant="outlined">
                Reset
              </Button>
              <Button type="submit" variant="contained">
                Submit
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Form>
    </Paper>
  );
}
