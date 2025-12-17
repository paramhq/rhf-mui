import { z } from 'zod';
import { Paper, Typography, Button, Grid, Divider, Box } from '@mui/material';
import { Form, RHFMaskedField, RHFTextField } from '@paramhq/forms';

const maskedFieldsSchema = z.object({
  phone: z.string().min(10, 'Phone number is required'),
  creditCard: z.string().min(16, 'Credit card number is required'),
  ssn: z.string().optional(),
  zipCode: z.string().optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  customCode: z.string().optional(),
});

type MaskedFieldsFormData = z.infer<typeof maskedFieldsSchema>;

export function MaskedFieldsDemo() {
  const handleSubmit = (data: MaskedFieldsFormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data (values are unmasked by default).');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Masked Input Fields
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates RHFMaskedField component using react-imask. Mask patterns: 0 = digit, a = letter, * = any character.
        By default, values are stored unmasked (without formatting characters).
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={maskedFieldsSchema}
        defaultValues={{
          phone: '',
          creditCard: '',
          ssn: '',
          zipCode: '',
          date: '',
          time: '',
          customCode: '',
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Phone Number (US Format)
            </Typography>
            <RHFMaskedField
              name="phone"
              label="Phone Number"
              mask="(000) 000-0000"
              placeholder="(___) ___-____"
              helperText="Format: (123) 456-7890"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Credit Card
            </Typography>
            <RHFMaskedField
              name="creditCard"
              label="Credit Card Number"
              mask="0000 0000 0000 0000"
              placeholder="____ ____ ____ ____"
              helperText="16-digit card number"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              SSN (Always Visible)
            </Typography>
            <RHFMaskedField
              name="ssn"
              label="Social Security Number"
              mask="000-00-0000"
              lazy={false}
              placeholderChar="_"
              helperText="lazy=false shows mask immediately"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              ZIP Code
            </Typography>
            <RHFMaskedField
              name="zipCode"
              label="ZIP Code"
              mask="00000"
              helperText="5-digit ZIP code"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Date (MM/DD/YYYY)
            </Typography>
            <RHFMaskedField
              name="date"
              label="Date"
              mask="00/00/0000"
              placeholder="MM/DD/YYYY"
              helperText="Manual date entry with mask"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Time (HH:MM)
            </Typography>
            <RHFMaskedField
              name="time"
              label="Time"
              mask="00:00"
              placeholder="HH:MM"
              helperText="24-hour format"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Custom Pattern (ABC-1234)
            </Typography>
            <RHFMaskedField
              name="customCode"
              label="Product Code"
              mask="AAA-0000"
              definitions={{
                A: /[A-Za-z]/,
              }}
              helperText="Custom definition: A = letter"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Regular TextField (for comparison)
            </Typography>
            <RHFTextField
              name="phone"
              label="Phone (no mask)"
              placeholder="Enter phone"
              helperText="Same field without mask"
              disabled
            />
          </Grid>

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

export default MaskedFieldsDemo;
