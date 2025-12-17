import { z } from 'zod';
import { Paper, Typography, Button, Grid, Divider, Box } from '@mui/material';
import {
  Form,
  RHFSelect,
  RHFRadioGroup,
  RHFCheckbox,
  RHFCheckboxGroup,
  RHFSwitch,
} from '@paramhq/forms';

const selectionSchema = z.object({
  country: z.string().min(1, 'Please select a country'),
  gender: z.string().min(1, 'Please select your gender'),
  size: z.string().min(1, 'Please select a size'),
  acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms'),
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  newsletter: z.boolean().optional(),
  notifications: z.boolean().optional(),
});

type SelectionFormData = z.infer<typeof selectionSchema>;

const countries = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'in', label: 'India' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
];

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not', label: 'Prefer not to say' },
];

const sizeOptions = [
  { value: 'xs', label: 'XS' },
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

const interestOptions = [
  { value: 'sports', label: 'Sports' },
  { value: 'music', label: 'Music' },
  { value: 'reading', label: 'Reading' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'cooking', label: 'Cooking' },
  { value: 'travel', label: 'Travel' },
];

export function SelectionFieldsDemo() {
  const handleSubmit = (data: SelectionFormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Selection Fields
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates RHFSelect, RHFRadioGroup, RHFCheckbox, RHFCheckboxGroup, and RHFSwitch
        components.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={selectionSchema}
        defaultValues={{
          country: '',
          gender: '',
          size: '',
          acceptTerms: false,
          interests: [],
          newsletter: false,
          notifications: true,
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFSelect
              name="country"
              label="Country"
              options={countries}
              placeholder="Select your country"
              clearable
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFRadioGroup name="gender" label="Gender" options={genderOptions} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RHFRadioGroup name="size" label="T-Shirt Size" options={sizeOptions} row />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Interests (Select multiple)
            </Typography>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RHFCheckboxGroup name="interests" options={interestOptions} row />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Preferences
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFSwitch name="newsletter" label="Subscribe to newsletter" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFSwitch name="notifications" label="Enable notifications" color="secondary" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RHFCheckbox
              name="acceptTerms"
              label="I accept the terms and conditions"
              color="primary"
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
