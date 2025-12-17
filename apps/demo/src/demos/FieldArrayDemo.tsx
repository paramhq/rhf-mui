import { z } from 'zod';
import { Paper, Typography, Button, Grid2 as Grid, Divider, Box } from '@mui/material';
import {
  Form,
  RHFFieldArray,
  RHFTextField,
  RHFNumberField,
  RHFSelect,
} from '@rhf-mui/core';

const phoneTypes = [
  { value: 'mobile', label: 'Mobile' },
  { value: 'home', label: 'Home' },
  { value: 'work', label: 'Work' },
];

const relationTypes = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'other', label: 'Other' },
];

const fieldArraySchema = z.object({
  phones: z
    .array(
      z.object({
        type: z.string().min(1, 'Phone type is required'),
        number: z.string().min(10, 'Phone number must be at least 10 digits'),
      })
    )
    .min(1, 'At least one phone number is required')
    .max(5, 'Maximum 5 phone numbers allowed'),
  nominees: z
    .array(
      z.object({
        name: z.string().min(2, 'Name is required'),
        relation: z.string().min(1, 'Relation is required'),
        percentage: z.number().min(1, 'Minimum 1%').max(100, 'Maximum 100%'),
      })
    )
    .min(1, 'At least one nominee is required')
    .max(4, 'Maximum 4 nominees allowed')
    .refine(
      (nominees) => {
        const total = nominees.reduce((sum, n) => sum + (n.percentage || 0), 0);
        return total === 100;
      },
      { message: 'Nominee percentages must total 100%' }
    ),
});

type FieldArrayFormData = z.infer<typeof fieldArraySchema>;

export function FieldArrayDemo() {
  const handleSubmit = (data: FieldArrayFormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Field Arrays
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates RHFFieldArray component with different variants: default, card, and compact.
        Supports min/max items, reordering, and dynamic add/remove.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={fieldArraySchema}
        defaultValues={{
          phones: [{ type: 'mobile', number: '' }],
          nominees: [{ name: '', relation: '', percentage: 100 }],
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Phone Numbers (Compact Variant)
            </Typography>
            <RHFFieldArray
              name="phones"
              defaultValue={{ type: 'mobile', number: '' }}
              minItems={1}
              maxItems={5}
              variant="compact"
              addButtonText="Add Phone"
            >
              {({ namePrefix }) => (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <RHFSelect
                      name={`${namePrefix}.type`}
                      label="Type"
                      options={phoneTypes}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <RHFTextField
                      name={`${namePrefix}.number`}
                      label="Phone Number"
                      size="small"
                    />
                  </Grid>
                </Grid>
              )}
            </RHFFieldArray>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              Nominees (Card Variant with Reorder)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Percentages must total exactly 100%
            </Typography>
            <RHFFieldArray
              name="nominees"
              defaultValue={{ name: '', relation: '', percentage: 0 }}
              minItems={1}
              maxItems={4}
              variant="card"
              reorderable
              addButtonText="Add Nominee"
            >
              {({ namePrefix, index }) => (
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="primary">
                      Nominee {index + 1}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <RHFTextField name={`${namePrefix}.name`} label="Full Name" />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <RHFSelect
                      name={`${namePrefix}.relation`}
                      label="Relation"
                      options={relationTypes}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <RHFNumberField
                      name={`${namePrefix}.percentage`}
                      label="Percentage"
                      min={1}
                      max={100}
                    />
                  </Grid>
                </Grid>
              )}
            </RHFFieldArray>
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
