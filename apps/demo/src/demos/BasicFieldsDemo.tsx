import { z } from 'zod';
import { Paper, Typography, Button, Grid2 as Grid, Divider, Box } from '@mui/material';
import {
  Form,
  RHFTextField,
  RHFNumberField,
  RHFPasswordField,
  RHFTextArea,
  RHFSlider,
  RHFRating,
  RHFFileUpload,
} from '@rhf-mui/core';

const basicSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(18, 'Must be at least 18').max(120, 'Must be at most 120'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  satisfaction: z.number().min(1).max(5).optional(),
  volume: z.number().min(0).max(100).optional(),
  avatar: z.any().optional(),
});

type BasicFormData = z.infer<typeof basicSchema>;

export function BasicFieldsDemo() {
  const handleSubmit = (data: BasicFormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Basic Form Fields
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates RHFTextField, RHFNumberField, RHFPasswordField, RHFTextArea, RHFSlider,
        RHFRating, and RHFFileUpload components.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={basicSchema}
        defaultValues={{
          firstName: '',
          lastName: '',
          email: '',
          age: 25,
          password: '',
          bio: '',
          satisfaction: 3,
          volume: 50,
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFTextField name="firstName" label="First Name" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFTextField name="lastName" label="Last Name" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <RHFTextField name="email" label="Email Address" type="email" />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFNumberField name="age" label="Age" min={0} max={120} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFPasswordField name="password" label="Password" showToggle />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <RHFTextArea
              name="bio"
              label="Bio"
              placeholder="Tell us about yourself..."
              minRows={3}
              maxRows={6}
              showCharacterCount
              maxLength={500}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Additional Controls
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFSlider
              name="volume"
              label="Volume"
              min={0}
              max={100}
              showValue
              formatValue={(v) => `${v}%`}
              valueLabelDisplay="auto"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFRating name="satisfaction" label="Satisfaction" showValue max={5} size="large" />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <RHFFileUpload
              name="avatar"
              label="Profile Picture"
              accept="image/*"
              variant="dropzone"
              showPreview
              maxSize={5 * 1024 * 1024}
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
