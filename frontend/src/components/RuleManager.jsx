import React, { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import axios from 'axios';

export default function RuleManager() {
  const [rules, setRules] = useState([]);
  const [open, setOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    type: '',
    log_type: 'apache',
    enabled: true,
    description: '',
    priority: '',
    conditions: '', // as JSON string
    aggregation: { group_by: '', count: '', timespan: '' },
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await axios.get('http://localhost:4000/api/rules');
      setRules(res.data);
    } catch (e) { /* handle error */ }
  };

  const handleAddRule = async () => {
    try {
      // Parse conditions from JSON string
      let parsedConditions = [];
      try {
        parsedConditions = JSON.parse(newRule.conditions);
      } catch (e) {
        alert('Conditions must be valid JSON (array of objects)');
        return;
      }
      // Build rule object
      const ruleToSend = {
        name: newRule.name,
        type: newRule.type,
        log_type: newRule.log_type,
        enabled: newRule.enabled,
        description: newRule.description,
        priority: newRule.priority,
        conditions: parsedConditions,
      };
      if (newRule.type === 'threshold') {
        ruleToSend.aggregation = {
          group_by: newRule.aggregation.group_by,
          count: Number(newRule.aggregation.count),
          timespan: newRule.aggregation.timespan,
        };
      }
      await axios.post('http://localhost:4000/api/rules', ruleToSend);
      setOpen(false);
      setNewRule({
        name: '',
        type: '',
        log_type: 'apache',
        enabled: true,
        description: '',
        priority: '',
        conditions: '',
        aggregation: { group_by: '', count: '', timespan: '' },
      });
      fetchRules();
    } catch (e) { /* handle error */ }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6">Rule Management</Typography>
      <Button variant="contained" onClick={() => setOpen(true)}>Add Rule</Button>
      <List dense>
        {rules.map((rule, idx) => (
          <ListItem key={idx} divider>
            <ListItemText
              primary={`${rule.name} [${rule.type}]`}
              secondary={rule.description}
            />
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Rule</DialogTitle>
        <DialogContent>
          <TextField label="Name" fullWidth margin="dense" value={newRule.name} onChange={e => setNewRule({ ...newRule, name: e.target.value })} />
          <TextField label="Type (pattern or threshold)" fullWidth margin="dense" value={newRule.type} onChange={e => setNewRule({ ...newRule, type: e.target.value })} />
          <TextField label="Log Type" fullWidth margin="dense" value={newRule.log_type} onChange={e => setNewRule({ ...newRule, log_type: e.target.value })} />
          <TextField label="Description" fullWidth margin="dense" value={newRule.description} onChange={e => setNewRule({ ...newRule, description: e.target.value })} />
          <TextField label="Priority" fullWidth margin="dense" value={newRule.priority} onChange={e => setNewRule({ ...newRule, priority: e.target.value })} />
          <TextField label="Conditions (JSON array)" fullWidth margin="dense" value={newRule.conditions} onChange={e => setNewRule({ ...newRule, conditions: e.target.value })} helperText='e.g. [{"field":"path","operator":"contains_any","value":["../"]}]' />
          {newRule.type === 'threshold' && (
            <>
              <TextField label="Aggregation Group By" fullWidth margin="dense" value={newRule.aggregation.group_by} onChange={e => setNewRule({ ...newRule, aggregation: { ...newRule.aggregation, group_by: e.target.value } })} />
              <TextField label="Aggregation Count" fullWidth margin="dense" value={newRule.aggregation.count} onChange={e => setNewRule({ ...newRule, aggregation: { ...newRule.aggregation, count: e.target.value } })} />
              <TextField label="Aggregation Timespan (e.g. 1m)" fullWidth margin="dense" value={newRule.aggregation.timespan} onChange={e => setNewRule({ ...newRule, aggregation: { ...newRule.aggregation, timespan: e.target.value } })} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddRule}>Add</Button>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
} 