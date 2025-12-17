import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';

// Demo components
import { BasicFieldsDemo } from './demos/BasicFieldsDemo';
import { SelectionFieldsDemo } from './demos/SelectionFieldsDemo';
import { AutocompleteDemo } from './demos/AutocompleteDemo';
import { DateTimeDemo } from './demos/DateTimeDemo';
import { FieldArrayDemo } from './demos/FieldArrayDemo';
import { IndiaFieldsDemo } from './demos/IndiaFieldsDemo';
import { CompleteFormDemo } from './demos/CompleteFormDemo';
import { MaskedFieldsDemo } from './demos/MaskedFieldsDemo';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`demo-tabpanel-${index}`}
      aria-labelledby={`demo-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `demo-tab-${index}`,
    'aria-controls': `demo-tabpanel-${index}`,
  };
}

function App() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            RHF-MUI Components Demo
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 2 }}>
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="demo tabs"
          >
            <Tab label="Basic Fields" {...a11yProps(0)} />
            <Tab label="Selection" {...a11yProps(1)} />
            <Tab label="Autocomplete" {...a11yProps(2)} />
            <Tab label="Date/Time" {...a11yProps(3)} />
            <Tab label="Field Array" {...a11yProps(4)} />
            <Tab label="India Fields" {...a11yProps(5)} />
            <Tab label="Complete Form" {...a11yProps(6)} />
            <Tab label="Masked Fields" {...a11yProps(7)} />
          </Tabs>
        </Paper>

        <TabPanel value={tabValue} index={0}>
          <BasicFieldsDemo />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <SelectionFieldsDemo />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <AutocompleteDemo />
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <DateTimeDemo />
        </TabPanel>
        <TabPanel value={tabValue} index={4}>
          <FieldArrayDemo />
        </TabPanel>
        <TabPanel value={tabValue} index={5}>
          <IndiaFieldsDemo />
        </TabPanel>
        <TabPanel value={tabValue} index={6}>
          <CompleteFormDemo />
        </TabPanel>
        <TabPanel value={tabValue} index={7}>
          <MaskedFieldsDemo />
        </TabPanel>
      </Container>
    </Box>
  );
}

export default App;
