import { z } from 'zod';
import { Paper, Typography, Button, Grid, Divider, Box, Alert } from '@mui/material';
import {
  Form,
  RHFOTP,
  RHFColorPicker,
  RHFPhoneInput,
  RHFRichText,
  RHFSignature,
} from '@paramhq/forms';

const advancedSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  brandColor: z.string().regex(/^#([A-Fa-f0-9]{6})$/, 'Invalid hex color'),
  phone: z.string().min(10, 'Phone number is required'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  signature: z.string().min(1, 'Signature is required'),
});

type AdvancedFormData = z.infer<typeof advancedSchema>;

export function AdvancedFieldsDemo() {
  const handleSubmit = (data: AdvancedFormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Advanced Form Fields
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates RHFOTP, RHFColorPicker, RHFPhoneInput, RHFRichText, and RHFSignature components.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Some components require optional peer dependencies:
        <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
          <li><code>react-phone-number-input</code> - for RHFPhoneInput</li>
          <li><code>@tiptap/react @tiptap/starter-kit</code> - for RHFRichText</li>
          <li><code>signature_pad</code> - for RHFSignature</li>
        </ul>
      </Alert>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={advancedSchema}
        defaultValues={{
          otp: '',
          brandColor: '#2196f3',
          phone: '',
          content: '',
          signature: '',
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          {/* OTP Input */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              OTP Input
            </Typography>
            <RHFOTP
              name="otp"
              label="Enter Verification Code"
              length={6}
              type="number"
              autoFocus
              onComplete={(otp) => console.log('OTP complete:', otp)}
            />
          </Grid>

          {/* OTP with separator */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" gutterBottom>
              OTP with Separator
            </Typography>
            <RHFOTP
              name="otp"
              length={6}
              type="number"
              separator="-"
              separatorPosition="3"
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Color Picker */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFColorPicker
              name="brandColor"
              label="Brand Color"
              helperText="Choose your brand color"
            />
          </Grid>

          {/* Color Picker with custom presets */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFColorPicker
              name="brandColor"
              label="Theme Color (Custom Presets)"
              presets={[
                '#1976d2', '#388e3c', '#d32f2f', '#7b1fa2',
                '#f57c00', '#0288d1', '#689f38', '#e64a19',
              ]}
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Phone Input */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFPhoneInput
              name="phone"
              label="Phone Number"
              defaultCountry="US"
              placeholder="Enter phone number"
            />
          </Grid>

          {/* Phone Input - India default */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <RHFPhoneInput
              name="phone"
              label="Phone (India Default)"
              defaultCountry="IN"
              onCountryChange={(country) => console.log('Country changed:', country)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Rich Text Editor */}
          <Grid size={{ xs: 12 }}>
            <RHFRichText
              name="content"
              label="Article Content"
              placeholder="Write your article content here..."
              minHeight={200}
              toolbar={['bold', 'italic', 'underline', 'heading', 'bulletList', 'orderedList', 'link']}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Signature Pad */}
          <Grid size={{ xs: 12, md: 6 }}>
            <RHFSignature
              name="signature"
              label="Your Signature"
              width={400}
              height={200}
              penColor="#000000"
              backgroundColor="#ffffff"
            />
          </Grid>

          {/* Signature Pad - Custom styling */}
          <Grid size={{ xs: 12, md: 6 }}>
            <RHFSignature
              name="signature"
              label="Signature (Blue Ink)"
              width={400}
              height={200}
              penColor="#1976d2"
              backgroundColor="#f5f5f5"
              clearButtonText="Clear Signature"
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
