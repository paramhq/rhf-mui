import { z } from 'zod';
import dayjs from 'dayjs';
import { Paper, Typography, Button, Grid2 as Grid, Divider, Box } from '@mui/material';
import { Form, RHFDatePicker, RHFTimePicker, RHFDateTimePicker } from '@rhf-mui/core';

const dateTimeSchema = z.object({
  birthDate: z.any().refine((val) => val !== null, 'Birth date is required'),
  appointmentDate: z.any().optional(),
  meetingTime: z.any().optional(),
  eventDateTime: z.any().optional(),
  expiryDate: z.any().optional(),
});

type DateTimeFormData = z.infer<typeof dateTimeSchema>;

export function DateTimeDemo() {
  const handleSubmit = (data: DateTimeFormData) => {
    // Convert dayjs objects to ISO strings for logging
    const formattedData = {
      ...data,
      birthDate: data.birthDate?.toISOString?.() ?? data.birthDate,
      appointmentDate: data.appointmentDate?.toISOString?.() ?? data.appointmentDate,
      meetingTime: data.meetingTime?.toISOString?.() ?? data.meetingTime,
      eventDateTime: data.eventDateTime?.toISOString?.() ?? data.eventDateTime,
      expiryDate: data.expiryDate?.toISOString?.() ?? data.expiryDate,
    };
    console.log('Form submitted:', formattedData);
    alert('Form submitted! Check console for data.');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Date & Time Pickers
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates RHFDatePicker, RHFTimePicker, and RHFDateTimePicker components. Requires
        @mui/x-date-pickers and a date adapter (dayjs used here).
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={dateTimeSchema}
        defaultValues={{
          birthDate: null,
          appointmentDate: null,
          meetingTime: null,
          eventDateTime: null,
          expiryDate: null,
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Basic Date Picker
            </Typography>
            <RHFDatePicker
              name="birthDate"
              label="Date of Birth"
              disableFuture
              openTo="year"
              views={['year', 'month', 'day']}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Date with Restrictions
            </Typography>
            <RHFDatePicker
              name="appointmentDate"
              label="Appointment Date"
              disablePast
              maxDate={dayjs().add(3, 'month').toDate()}
              helperText="Select a date within next 3 months"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Year/Month Only
            </Typography>
            <RHFDatePicker
              name="expiryDate"
              label="Card Expiry"
              views={['year', 'month']}
              openTo="month"
              format="MM/YYYY"
              disablePast
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Time Picker (24h)
            </Typography>
            <RHFTimePicker name="meetingTime" label="Meeting Time" ampm={false} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Date & Time Combined
            </Typography>
            <RHFDateTimePicker
              name="eventDateTime"
              label="Event Date & Time"
              minDateTime={dayjs().toDate()}
              ampm
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
