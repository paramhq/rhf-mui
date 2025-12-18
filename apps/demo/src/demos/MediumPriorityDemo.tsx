import { z } from 'zod';
import { Paper, Typography, Button, Grid, Divider, Box, Alert } from '@mui/material';
import {
  Form,
  RHFTransferList,
  RHFTreeSelect,
  RHFDateRangePicker,
  RHFCreditCard,
  RHFAddressAutocomplete,
} from '@paramhq/forms';

const mediumPrioritySchema = z.object({
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
  department: z.string().min(1, 'Select a department'),
  categories: z.array(z.string()).optional(),
  dateRange: z.object({
    start: z.any().nullable(),
    end: z.any().nullable(),
  }).optional(),
  card: z.object({
    number: z.string().optional(),
    expiry: z.string().optional(),
    cvv: z.string().optional(),
    cardholderName: z.string().optional(),
  }).optional(),
  // Address fields - allow null or object with formatted string
  address: z.object({
    formatted: z.string(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).nullable().optional(),
  addressParsed: z.object({
    formatted: z.string(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).nullable().optional(),
});

type MediumPriorityFormData = z.infer<typeof mediumPrioritySchema>;

// Sample data for transfer list
const permissionItems = [
  { value: 'read', label: 'Read Access', description: 'View resources' },
  { value: 'write', label: 'Write Access', description: 'Create and edit resources' },
  { value: 'delete', label: 'Delete Access', description: 'Remove resources' },
  { value: 'admin', label: 'Admin Access', description: 'Full administrative control' },
  { value: 'export', label: 'Export Data', description: 'Download and export data' },
  { value: 'import', label: 'Import Data', description: 'Upload and import data' },
  { value: 'reports', label: 'View Reports', description: 'Access analytics and reports' },
  { value: 'settings', label: 'Manage Settings', description: 'Change system settings' },
];

// Sample tree data
const departmentTree = [
  {
    value: 'engineering',
    label: 'Engineering',
    children: [
      { value: 'frontend', label: 'Frontend Development' },
      { value: 'backend', label: 'Backend Development' },
      { value: 'devops', label: 'DevOps & Infrastructure' },
      {
        value: 'mobile',
        label: 'Mobile Development',
        children: [
          { value: 'ios', label: 'iOS Team' },
          { value: 'android', label: 'Android Team' },
        ],
      },
    ],
  },
  {
    value: 'design',
    label: 'Design',
    children: [
      { value: 'ux', label: 'UX Design' },
      { value: 'ui', label: 'UI Design' },
      { value: 'graphic', label: 'Graphic Design' },
    ],
  },
  {
    value: 'marketing',
    label: 'Marketing',
    children: [
      { value: 'content', label: 'Content Marketing' },
      { value: 'seo', label: 'SEO/SEM' },
      { value: 'social', label: 'Social Media' },
    ],
  },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance & Accounting' },
];

// Category tree for multiple selection
const categoryTree = [
  {
    value: 'electronics',
    label: 'Electronics',
    children: [
      { value: 'phones', label: 'Mobile Phones' },
      { value: 'laptops', label: 'Laptops' },
      { value: 'accessories', label: 'Accessories' },
    ],
  },
  {
    value: 'clothing',
    label: 'Clothing',
    children: [
      { value: 'men', label: "Men's Wear" },
      { value: 'women', label: "Women's Wear" },
      { value: 'kids', label: 'Kids' },
    ],
  },
  {
    value: 'home',
    label: 'Home & Living',
    children: [
      { value: 'furniture', label: 'Furniture' },
      { value: 'decor', label: 'Home Decor' },
    ],
  },
];

export function MediumPriorityDemo() {
  const handleSubmit = (data: MediumPriorityFormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Medium Priority Components Demo
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates RHFTransferList, RHFTreeSelect, RHFDateRangePicker, RHFCreditCard, 
        and RHFAddressAutocomplete components.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        <strong>Note:</strong> RHFAddressAutocomplete requires a Google Maps API key with Places library enabled.
        Pass your API key via the <code>apiKey</code> prop or use a custom <code>fetchSuggestions</code> function.
      </Alert>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={mediumPrioritySchema}
        defaultValues={{
          permissions: [],
          department: '',
          categories: [],
          dateRange: { start: null, end: null },
          card: { number: '', expiry: '', cvv: '', cardholderName: '' },
          address: null,
          addressParsed: null,
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          {/* Transfer List */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              1. Transfer List
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Move items between available and selected lists.
            </Typography>
            <RHFTransferList
              name="permissions"
              label="User Permissions"
              items={permissionItems}
              leftTitle="Available Permissions"
              rightTitle="Assigned Permissions"
              searchable
              searchPlaceholder="Search permissions..."
              height={250}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Tree Select - Single */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              2. Tree Select (Single)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Hierarchical selection with single value.
            </Typography>
            <RHFTreeSelect
              name="department"
              label="Department"
              nodes={departmentTree}
              placeholder="Select department..."
            />
          </Grid>

          {/* Tree Select - Multiple with checkboxes */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="h6" gutterBottom>
              Tree Select (Multiple)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Multiple selection with checkboxes.
            </Typography>
            <RHFTreeSelect
              name="categories"
              label="Product Categories"
              nodes={categoryTree}
              multiple
              checkboxSelection
              expandAll
              placeholder="Select categories..."
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Date Range Picker */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              3. Date Range Picker
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Select a date range with start and end dates.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RHFDateRangePicker
              name="dateRange"
              label="Report Period"
              startLabel="From"
              endLabel="To"
              direction="row"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RHFDateRangePicker
              name="dateRange"
              label="Report Period (Vertical)"
              startLabel="Start Date"
              endLabel="End Date"
              direction="column"
              spacing={1}
              size="small"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Credit Card */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              4. Credit Card Input
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Card number with Luhn validation, expiry date, and CVV.
              Supports Visa, Mastercard, Amex, Discover, and RuPay.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <RHFCreditCard
              name="card"
              label="Payment Card"
              showCardholderName
              onCardTypeChange={(type) => console.log('Card type:', type)}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Address Autocomplete */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom>
              5. Address Autocomplete
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Google Places integration for address lookup. Requires API key.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RHFAddressAutocomplete
              name="address"
              label="Shipping Address"
              placeholder="Start typing your address..."
              // apiKey="YOUR_GOOGLE_MAPS_API_KEY" // Uncomment and add your key
              countries={['US', 'CA', 'IN']}
              onAddressSelect={(addr) => console.log('Address selected:', addr)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RHFAddressAutocomplete
              name="addressParsed"
              label="Address with Parsed Fields"
              showParsedFields
              // apiKey="YOUR_GOOGLE_MAPS_API_KEY"
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
