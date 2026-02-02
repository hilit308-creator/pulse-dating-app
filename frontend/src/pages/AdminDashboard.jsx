/**
 * AdminDashboard - Full Admin Panel
 * 
 * Main dashboard for admin users with 24/7 access
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Users,
  AlertTriangle,
  BarChart3,
  Settings,
  Search,
  Ban,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Shield,
  Activity,
  TrendingUp,
  Clock,
  ArrowLeft,
  FileText,
  ExternalLink,
  FolderOpen,
} from 'lucide-react';
import AdminService, { USER_ROLES } from '../services/AdminService';
import { useLanguage } from '../context/LanguageContext';

// Mock data for demo
const MOCK_STATS = {
  totalUsers: 12450,
  activeToday: 3420,
  newToday: 156,
  pendingReports: 23,
  revenue: 45600,
  matches: 890,
};

const MOCK_USERS = [
  { id: 1, name: 'David Cohen', email: 'david@test.com', status: 'active', joined: '2026-01-01', reports: 0 },
  { id: 2, name: 'Sarah Levi', email: 'sarah@test.com', status: 'active', joined: '2026-01-02', reports: 1 },
  { id: 3, name: 'Michael Stern', email: 'michael@test.com', status: 'suspended', joined: '2025-12-15', reports: 3 },
  { id: 4, name: 'Rachel Gold', email: 'rachel@test.com', status: 'active', joined: '2026-01-05', reports: 0 },
  { id: 5, name: 'Yossi Ben', email: 'yossi@test.com', status: 'banned', joined: '2025-11-20', reports: 5 },
];

const MOCK_REPORTS = [
  { id: 1, reporter: 'User A', reported: 'User B', type: 'inappropriate_content', status: 'pending', date: '2026-01-07' },
  { id: 2, reporter: 'User C', reported: 'User D', type: 'harassment', status: 'pending', date: '2026-01-07' },
  { id: 3, reporter: 'User E', reported: 'User F', type: 'fake_profile', status: 'resolved', date: '2026-01-06' },
];

// Documentation files
const DOCS_FILES = [
  { category: 'Points Hub', files: [
    { name: 'Pulse_PointsHub_Spec.md', desc: 'Points Hub Specification' },
    { name: 'Pulse_Points_API_Contract.yaml', desc: 'API Contract' },
    { name: 'Pulse_Points_QA_Checklist.md', desc: 'QA Checklist' },
    { name: 'Pulse_Points_Jira_Tickets.md', desc: 'Jira Tickets' },
    { name: 'Pulse_PointsHub_UI_Spec.md', desc: 'UI Specification' },
    { name: 'Pulse_PointsHub_EdgeCase_Matrix.md', desc: 'Edge Case Matrix' },
    { name: 'Pulse_Points_Freeze_V1.md', desc: 'V1 Freeze Document' },
  ]},
  { category: 'BeatPulse', files: [
    { name: 'Pulse_BeatPulse_Spec.md', desc: 'BeatPulse Specification' },
    { name: 'Pulse_BeatPulse_API_Contract.yaml', desc: 'API Contract' },
    { name: 'Pulse_BeatPulse_QA_Checklist.md', desc: 'QA Checklist' },
    { name: 'Pulse_BeatPulse_Jira_Tickets.md', desc: 'Jira Tickets' },
  ]},
  { category: 'Likes You', files: [
    { name: 'Pulse_LikesYou_Spec.md', desc: 'Likes You Specification' },
    { name: 'Pulse_LikesYou_API_Contract.yaml', desc: 'API Contract' },
    { name: 'Pulse_LikesYou_QA_Checklist.md', desc: 'QA Checklist' },
    { name: 'Pulse_LikesYou_Jira_Tickets.md', desc: 'Jira Tickets' },
  ]},
  { category: 'Undo', files: [
    { name: 'Pulse_Undo_Spec.md', desc: 'Undo Specification' },
    { name: 'Pulse_Undo_API_Contract.yaml', desc: 'API Contract' },
    { name: 'Pulse_Undo_QA_Checklist.md', desc: 'QA Checklist' },
    { name: 'Pulse_Undo_Jira_Tickets.md', desc: 'Jira Tickets' },
  ]},
  { category: 'Nearby Priority', files: [
    { name: 'Pulse_NearbyPriority_Spec.md', desc: 'Nearby Priority Specification' },
    { name: 'Pulse_NearbyPriority_API_Contract.yaml', desc: 'API Contract' },
    { name: 'Pulse_NearbyPriority_QA_Checklist.md', desc: 'QA Checklist' },
    { name: 'Pulse_NearbyPriority_Jira_Tickets.md', desc: 'Jira Tickets' },
  ]},
  { category: 'Admin', files: [
    { name: 'Pulse_Admin_Role_Spec.md', desc: 'Admin Role Specification' },
  ]},
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', user: null });
  const [actionReason, setActionReason] = useState('');
  
  // Check admin access
  useEffect(() => {
    const user = AdminService.getCurrentUser();
    if (!AdminService.isAdmin(user)) {
      // For demo, allow access
      console.log('[Admin] Access check - demo mode');
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleUserAction = async (type, user) => {
    setActionDialog({ open: true, type, user });
  };

  const executeAction = async () => {
    const { type, user } = actionDialog;
    
    setLoading(true);
    try {
      switch (type) {
        case 'suspend':
          await AdminService.suspendUser(user.id, actionReason);
          break;
        case 'ban':
          await AdminService.banUser(user.id, actionReason);
          break;
        case 'delete':
          await AdminService.deleteUser(user.id, actionReason);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Action failed:', error);
    }
    
    setLoading(false);
    setActionDialog({ open: false, type: '', user: null });
    setActionReason('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'banned': return 'error';
      default: return 'default';
    }
  };

  // Stats Card Component
  const StatCard = ({ icon: Icon, title, value, color, trend }) => (
    <Paper
      sx={{
        p: 3,
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontSize: 14, color: '#64748b', mb: 1 }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
              <TrendingUp size={14} color="#22c55e" />
              <Typography sx={{ fontSize: 12, color: '#22c55e' }}>
                +{trend}%
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={24} color={color} />
        </Box>
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#1e293b',
          color: '#fff',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Shield size={28} />
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
            Admin Dashboard
          </Typography>
          <Typography sx={{ fontSize: 12, opacity: 0.7 }}>
            Full Access · 24/7
          </Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Activity size={16} />
          <Typography sx={{ fontSize: 12 }}>
            {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          sx={{
            px: 3,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          <Tab icon={<BarChart3 size={18} />} label="Overview" iconPosition="start" />
          <Tab icon={<Users size={18} />} label="Users" iconPosition="start" />
          <Tab icon={<AlertTriangle size={18} />} label="Reports" iconPosition="start" />
          <Tab icon={<FileText size={18} />} label="Docs" iconPosition="start" />
          <Tab icon={<Settings size={18} />} label="Settings" iconPosition="start" />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3 }}>
        {/* Tab 0: Overview */}
        {currentTab === 0 && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  icon={Users}
                  title="Total Users"
                  value={MOCK_STATS.totalUsers}
                  color="#6366f1"
                  trend={12}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  icon={Activity}
                  title="Active Today"
                  value={MOCK_STATS.activeToday}
                  color="#22c55e"
                  trend={8}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  icon={TrendingUp}
                  title="New Today"
                  value={MOCK_STATS.newToday}
                  color="#f59e0b"
                  trend={15}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  icon={AlertTriangle}
                  title="Pending Reports"
                  value={MOCK_STATS.pendingReports}
                  color="#ef4444"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  icon={Clock}
                  title="Matches Today"
                  value={MOCK_STATS.matches}
                  color="#ec4899"
                  trend={5}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  icon={BarChart3}
                  title="Revenue (₪)"
                  value={MOCK_STATS.revenue}
                  color="#8b5cf6"
                  trend={20}
                />
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              <Typography sx={{ fontWeight: 600 }}>Admin Mode Active</Typography>
              <Typography sx={{ fontSize: 14 }}>
                You have full access to all system features. All actions are logged.
              </Typography>
            </Alert>
          </>
        )}

        {/* Tab 1: Users */}
        {currentTab === 1 && (
          <>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="#64748b" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    bgcolor: '#fff',
                  },
                }}
              />
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Reports</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MOCK_USERS.filter(u => 
                    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#6366f1' }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Typography sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          color={getStatusColor(user.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{user.joined}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.reports}
                          color={user.reports > 0 ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedUser(user)}
                          title="View"
                        >
                          <Eye size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleUserAction('suspend', user)}
                          title="Suspend"
                          disabled={user.status === 'banned'}
                        >
                          <Ban size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleUserAction('delete', user)}
                          title="Delete"
                          sx={{ color: '#ef4444' }}
                        >
                          <Trash2 size={18} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}

        {/* Tab 2: Reports */}
        {currentTab === 2 && (
          <TableContainer component={Paper} sx={{ borderRadius: '16px' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Reporter</TableCell>
                  <TableCell>Reported User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {MOCK_REPORTS.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>#{report.id}</TableCell>
                    <TableCell>{report.reporter}</TableCell>
                    <TableCell>{report.reported}</TableCell>
                    <TableCell>
                      <Chip
                        label={report.type.replace('_', ' ')}
                        size="small"
                        color={report.type === 'harassment' ? 'error' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        size="small"
                        color={report.status === 'pending' ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell align="right">
                      {report.status === 'pending' && (
                        <>
                          <IconButton size="small" title="Approve" sx={{ color: '#22c55e' }}>
                            <CheckCircle size={18} />
                          </IconButton>
                          <IconButton size="small" title="Dismiss" sx={{ color: '#ef4444' }}>
                            <XCircle size={18} />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Tab 3: Docs */}
        {currentTab === 3 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <FolderOpen size={24} color="#6366f1" />
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                Documentation
              </Typography>
              <Chip label={`${DOCS_FILES.reduce((acc, cat) => acc + cat.files.length, 0)} files`} size="small" />
            </Box>
            
            <Grid container spacing={3}>
              {DOCS_FILES.map((category) => (
                <Grid item xs={12} md={6} key={category.category}>
                  <Paper sx={{ p: 3, borderRadius: '16px' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 2, color: '#6366f1' }}>
                      {category.category}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {category.files.map((file) => (
                        <Box
                          key={file.name}
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            bgcolor: '#f8fafc',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': { bgcolor: '#e2e8f0' },
                          }}
                        >
                          <FileText size={18} color="#64748b" />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                              {file.name}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#64748b' }}>
                              {file.desc}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => window.open(`https://github.com/hilit308-creator/pulse-dating-app/blob/main/frontend/docs/${file.name}`, '_blank')}
                          >
                            <ExternalLink size={16} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            <Alert severity="info" sx={{ mt: 3, borderRadius: '12px' }}>
              <Typography sx={{ fontWeight: 600 }}>GitHub Repository</Typography>
              <Typography sx={{ fontSize: 14 }}>
                All docs are available at:{' '}
                <a 
                  href="https://github.com/hilit308-creator/pulse-dating-app/tree/main/frontend/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#6366f1' }}
                >
                  github.com/hilit308-creator/pulse-dating-app
                </a>
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Tab 4: Settings */}
        {currentTab === 4 && (
          <Paper sx={{ p: 3, borderRadius: '16px' }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, mb: 3 }}>
              System Settings
            </Typography>
            <Alert severity="warning" sx={{ borderRadius: '12px' }}>
              Settings panel coming soon. Contact super admin for changes.
            </Alert>
          </Paper>
        )}
      </Box>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: '', user: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog.type === 'suspend' && 'Suspend User'}
          {actionDialog.type === 'ban' && 'Ban User'}
          {actionDialog.type === 'delete' && 'Delete User'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            {actionDialog.user?.name} ({actionDialog.user?.email})
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason"
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
            placeholder="Enter reason for this action..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: '', user: null })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={executeAction}
            disabled={loading || !actionReason}
          >
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
