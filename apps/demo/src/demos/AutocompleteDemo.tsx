import { useState } from 'react';
import { z } from 'zod';
import { Paper, Typography, Button, Grid, Divider, Box, Chip } from '@mui/material';
import {
  Form,
  RHFAutocomplete,
  RHFMultiAutocomplete,
  RHFAsyncAutocomplete,
  RHFCreatableAutocomplete,
  SelectOption,
} from '@paramhq/forms';

const autocompleteSchema = z.object({
  country: z.string().min(1, 'Please select a country'),
  skills: z.array(z.string()).min(1, 'Select at least one skill'),
  member: z.string().optional(),
  category: z.string().optional(),
});

type AutocompleteFormData = z.infer<typeof autocompleteSchema>;

const countries: SelectOption[] = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 'ca', label: 'Canada', group: 'Americas' },
  { value: 'mx', label: 'Mexico', group: 'Americas' },
  { value: 'uk', label: 'United Kingdom', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
  { value: 'in', label: 'India', group: 'Asia' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'cn', label: 'China', group: 'Asia' },
  { value: 'au', label: 'Australia', group: 'Oceania' },
];

const skills: SelectOption[] = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
];

const categories: SelectOption[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'sports', label: 'Sports' },
];

// Simulated async member search
const searchMembers = async (search: string, signal: AbortSignal): Promise<SelectOption[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (signal.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  // Simulated member data
  const allMembers: SelectOption[] = [
    { value: '1', label: 'John Doe' },
    { value: '2', label: 'Jane Smith' },
    { value: '3', label: 'Bob Johnson' },
    { value: '4', label: 'Alice Williams' },
    { value: '5', label: 'Charlie Brown' },
    { value: '6', label: 'Diana Ross' },
    { value: '7', label: 'Edward Norton' },
    { value: '8', label: 'Fiona Apple' },
  ];

  return allMembers.filter((m) => m.label.toLowerCase().includes(search.toLowerCase()));
};

export function AutocompleteDemo() {
  const [createdCategories, setCreatedCategories] = useState<SelectOption[]>(categories);

  const handleSubmit = (data: AutocompleteFormData) => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
  };

  const handleCreateCategory = async (inputValue: string): Promise<SelectOption> => {
    // Simulate API call to create category
    await new Promise((resolve) => setTimeout(resolve, 300));

    const newCategory: SelectOption = {
      value: inputValue.toLowerCase().replace(/\s+/g, '-'),
      label: inputValue,
    };

    setCreatedCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Autocomplete Fields
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Demonstrates RHFAutocomplete (single), RHFMultiAutocomplete, RHFAsyncAutocomplete, and
        RHFCreatableAutocomplete components.
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Form
        schema={autocompleteSchema}
        defaultValues={{
          country: '',
          skills: [],
          member: '',
          category: '',
        }}
        onSubmit={handleSubmit}
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Single Select with Groups
            </Typography>
            <RHFAutocomplete
              name="country"
              label="Country"
              options={countries}
              groupBy={(option) => option.group ?? 'Other'}
              placeholder="Select a country"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Multi-Select (max 5)
            </Typography>
            <RHFMultiAutocomplete
              name="skills"
              label="Skills"
              options={skills}
              maxSelections={5}
              limitTags={3}
              placeholder="Select skills"
              renderChip={(option, onDelete) => (
                <Chip
                  label={option.label}
                  onDelete={onDelete}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Async Search (Server-side)
            </Typography>
            <RHFAsyncAutocomplete
              name="member"
              label="Search Member"
              fetchOptions={searchMembers}
              debounceMs={300}
              minSearchLength={2}
              cacheKey="members"
              placeholder="Type to search members..."
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="subtitle2" gutterBottom>
              Creatable (FreeSolo)
            </Typography>
            <RHFCreatableAutocomplete
              name="category"
              label="Category"
              options={createdCategories}
              onCreate={handleCreateCategory}
              addNewText="Create category"
              placeholder="Select or create category"
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
