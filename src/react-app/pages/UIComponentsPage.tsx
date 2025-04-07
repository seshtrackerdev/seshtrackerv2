import React, { useState } from 'react';
import { Button, Card, Input, Toggle, Badge, Tabs, Text, ThemeToggle } from '../components/ui';
import './UIComponentsPage.css';

const UIComponentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('buttons');
  const [toggleState, setToggleState] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>('');

  return (
    <div className="ui-components-page">
      <div className="ui-components-header">
        <h1>UI Components</h1>
        <p>A showcase of the reusable UI components available in the SeshTracker design system.</p>
      </div>

      <Tabs
        tabs={[
          { id: 'buttons', label: 'Buttons' },
          { id: 'inputs', label: 'Inputs' },
          { id: 'cards', label: 'Cards' },
          { id: 'badges', label: 'Badges' },
          { id: 'typography', label: 'Typography' }
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      <div className="ui-components-content">
        {activeTab === 'buttons' && (
          <div className="component-section">
            <h2>Buttons</h2>
            <p>Buttons are used to trigger actions or events.</p>
            
            <div className="component-grid">
              <div className="component-item">
                <h3>Primary Button</h3>
                <Button variant="primary">Primary Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Secondary Button</h3>
                <Button variant="secondary">Secondary Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Outline Button</h3>
                <Button variant="outline">Outline Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Ghost Button</h3>
                <Button variant="ghost">Ghost Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Danger Button</h3>
                <Button variant="danger">Danger Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Success Button</h3>
                <Button variant="success">Success Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Disabled Button</h3>
                <Button variant="primary" disabled>Disabled Button</Button>
              </div>
              
              <div className="component-item">
                <h3>Icon Button</h3>
                <Button variant="icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14"></path>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inputs' && (
          <div className="component-section">
            <h2>Inputs</h2>
            <p>Input components for collecting user data.</p>
            
            <div className="component-grid">
              <div className="component-item">
                <h3>Text Input</h3>
                <Input 
                  type="text" 
                  label="Text Input" 
                  placeholder="Enter text here"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              
              <div className="component-item">
                <h3>Password Input</h3>
                <Input 
                  type="password" 
                  label="Password Input" 
                  placeholder="Enter password"
                />
              </div>
              
              <div className="component-item">
                <h3>Disabled Input</h3>
                <Input 
                  type="text" 
                  label="Disabled Input" 
                  placeholder="This input is disabled"
                  disabled
                />
              </div>
              
              <div className="component-item">
                <h3>Toggle</h3>
                <Toggle 
                  label="Toggle Switch"
                  checked={toggleState}
                  onChange={() => setToggleState(!toggleState)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="component-section">
            <h2>Cards</h2>
            <p>Cards are containers for content and actions about a single subject.</p>
            
            <div className="component-grid">
              <div className="component-item-full">
                <h3>Basic Card</h3>
                <Card>
                  <h3>Card Title</h3>
                  <p>This is a basic card component for displaying content with a clean layout.</p>
                </Card>
              </div>
              
              <div className="component-item-full">
                <h3>Interactive Card</h3>
                <Card interactive>
                  <h3>Interactive Card</h3>
                  <p>This card has hover and active states to indicate that it's interactive.</p>
                  <Button variant="primary" size="small">Learn More</Button>
                </Card>
              </div>
              
              <div className="component-item-full">
                <h3>Elevated Card</h3>
                <Card elevated>
                  <h3>Elevated Card</h3>
                  <p>This card has a more pronounced shadow to create depth in the interface.</p>
                </Card>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="component-section">
            <h2>Badges</h2>
            <p>Badges are used to highlight status, labels, or counts.</p>
            
            <div className="component-grid">
              <div className="component-item">
                <h3>Primary Badge</h3>
                <Badge variant="primary">Primary</Badge>
              </div>
              
              <div className="component-item">
                <h3>Secondary Badge</h3>
                <Badge variant="secondary">Secondary</Badge>
              </div>
              
              <div className="component-item">
                <h3>Success Badge</h3>
                <Badge variant="success">Success</Badge>
              </div>
              
              <div className="component-item">
                <h3>Warning Badge</h3>
                <Badge variant="warning">Warning</Badge>
              </div>
              
              <div className="component-item">
                <h3>Danger Badge</h3>
                <Badge variant="danger">Danger</Badge>
              </div>
              
              <div className="component-item">
                <h3>Info Badge</h3>
                <Badge variant="info">Info</Badge>
              </div>
              
              <div className="component-item">
                <h3>Outline Badge</h3>
                <Badge variant="outline">Outline</Badge>
              </div>
              
              <div className="component-item">
                <h3>Count Badge</h3>
                <Badge variant="count">5</Badge>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="component-section">
            <h2>Typography</h2>
            <p>Typographic styles for consistent text presentation.</p>
            
            <div className="component-grid typography-grid">
              <div className="component-item-full">
                <h3>Headings</h3>
                <div className="typography-sample">
                  <Text variant="h1">Heading 1</Text>
                  <Text variant="h2">Heading 2</Text>
                  <Text variant="h3">Heading 3</Text>
                  <Text variant="h4">Heading 4</Text>
                  <Text variant="h5">Heading 5</Text>
                  <Text variant="h6">Heading 6</Text>
                </div>
              </div>
              
              <div className="component-item-full">
                <h3>Body Text</h3>
                <div className="typography-sample">
                  <Text variant="body1">Body 1 - Primary paragraph text for most UI elements.</Text>
                  <Text variant="body2">Body 2 - Smaller text for secondary information.</Text>
                  <Text variant="caption">Caption - Very small text for captions, labels, and other tertiary content.</Text>
                </div>
              </div>
              
              <div className="component-item-full">
                <h3>Specialized Text</h3>
                <div className="typography-sample">
                  <Text variant="gradient">Gradient Text - For primary headings and brand elements.</Text>
                  <Text variant="highlight">Highlighted Text - To emphasize important content.</Text>
                  <Text variant="muted">Muted Text - For less important information or disabled states.</Text>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIComponentsPage; 