import React from 'react';
import { motion } from 'framer-motion';
import { Grid, Layout, Move, Plus, Save, RotateCcw, Settings } from 'lucide-react';
import { Button, Card, CardBody, CardHeader } from '../ui';

const DashboardEditorPlaceholder: React.FC = () => {
  return (
    <div className="dashboard-editor">
      <div className="editor-header">
        <h1>Dashboard Editor</h1>
        <p className="editor-description">
          Build your custom dashboard by dragging and dropping widgets from the toolbar.
        </p>
        
        <div className="editor-actions">
          <Button variant="outline" size="sm" icon={<RotateCcw size={16} />}>
            Reset
          </Button>
          <Button variant="primary" size="sm" icon={<Save size={16} />}>
            Save Layout
          </Button>
        </div>
      </div>
      
      <div className="editor-container">
        <div className="editor-sidebar">
          <div className="sidebar-section">
            <h3>Widgets</h3>
            <div className="widget-items">
              <motion.div 
                className="widget-item"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="widget-icon">
                  <Grid size={20} />
                </div>
                <span>Stats Overview</span>
              </motion.div>
              
              <motion.div 
                className="widget-item"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="widget-icon">
                  <Layout size={20} />
                </div>
                <span>Recent Sessions</span>
              </motion.div>
              
              <motion.div 
                className="widget-item"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="widget-icon">
                  <Layout size={20} />
                </div>
                <span>Inventory</span>
              </motion.div>
              
              <motion.div 
                className="widget-item"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="widget-icon">
                  <Layout size={20} />
                </div>
                <span>Analytics Chart</span>
              </motion.div>
              
              <motion.div 
                className="widget-item"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="widget-icon">
                  <Layout size={20} />
                </div>
                <span>Quick Actions</span>
              </motion.div>
              
              <motion.div 
                className="widget-item add-new"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="widget-icon">
                  <Plus size={20} />
                </div>
                <span>Add Custom</span>
              </motion.div>
            </div>
          </div>
          
          <div className="sidebar-section">
            <h3>Settings</h3>
            <Button variant="outline" size="sm" icon={<Settings size={16} />} className="settings-button">
              Dashboard Settings
            </Button>
          </div>
        </div>
        
        <div className="editor-canvas">
          <div className="canvas-placeholder">
            <div className="placeholder-icon">
              <Move size={48} />
            </div>
            <h3>Drag Widgets Here</h3>
            <p>Select widgets from the sidebar and drag them onto this canvas to build your dashboard.</p>
            <Card className="coming-soon-notice">
              <CardBody>
                <p><strong>Coming Soon:</strong> The drag and drop dashboard editor is currently in development.</p>
                <p>In the future, you'll be able to:</p>
                <ul>
                  <li>Create fully customized dashboards</li>
                  <li>Resize and reposition widgets</li>
                  <li>Save multiple dashboard layouts</li>
                  <li>Create custom widgets</li>
                </ul>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardEditorPlaceholder; 