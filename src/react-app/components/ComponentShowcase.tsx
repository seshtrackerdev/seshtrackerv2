import React, { useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Checkbox,
  Input,
  Modal,
  Text,
  ThemeProvider,
  ThemeToggle,
  Toggle,
  TrendChart,
  RadarChart,
  HeatmapChart,
  BarChart,
  TimelineChart,
  RatingSlider,
  StrainLibrary,
  TagSelector,
  RichTextEditor,
  SessionWizard,
  SessionTimer,
  EffectTracker,
  SharingCard,
  CollaborativePanel,
  NotificationBanner,
} from './ui';

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none">
    <path d="M12 2c.5 0 2 2 2 2l1 1 2 2 1 1s2 1.5 2 2c0 1.5-2 6-6 6-4.5 0-6.5-5-6.5-7C7.5 6 12 2 12 2z" />
    <path d="M12 14c-4.5 0-6.5-5-6.5-7 0-2 4.5-5 6.5-5 .5 0 2 2 2 2l1 1 2 2 1 1s2 1.5 2 2c0 .5-1 2-2 2" />
    <path d="M12 22v-8" />
  </svg>
);

const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <ThemeProvider>
      <div className="showcase-container">
        <header className="showcase-header">
          <Text variant="h1">UI Component Library</Text>
          <Text variant="body" className="mb-md">A design system built for SeshTracker.com</Text>
          <div className="showcase-theme-toggle">
            <ThemeToggle />
          </div>
        </header>

        <div className="showcase-section">
          <Text variant="h2" className="mb-md">Typography</Text>
          <Card className="mb-lg">
            <CardBody>
              <Text variant="h1">Heading 1</Text>
              <Text variant="h2">Heading 2</Text>
              <Text variant="h3">Heading 3</Text>
              <Text variant="h4">Heading 4</Text>
              <Text variant="h5">Heading 5</Text>
              <Text variant="h6">Heading 6</Text>
              <Text variant="body-lg" className="mt-md">Large Body Text - Lorem ipsum dolor sit amet</Text>
              <Text variant="body">Regular Body Text - Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
              <Text variant="body-sm">Small Body Text - Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.</Text>
              <Text variant="caption" className="mt-sm">Caption Text - This is a caption</Text>
            </CardBody>
          </Card>
        </div>

        <div className="showcase-section">
          <Text variant="h2" className="mb-md">Buttons</Text>
          <Card className="mb-lg">
            <CardBody>
              <Text variant="h4" className="mb-sm">Standard Variants</Text>
              <div className="showcase-buttons mb-md">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="text">Text</Button>
                <Button variant="danger">Danger</Button>
              </div>

              <Text variant="h4" className="mb-sm mt-md">Cannabis-Themed Buttons</Text>
              <div className="showcase-buttons mb-md">
                <Button variant="cannabis">Cannabis</Button>
                <Button variant="purple">Purple</Button>
                <Button variant="gradient">Gradient</Button>
                <Button variant="gold">Gold</Button>
                <Button variant="pixel">Pixel</Button>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">Special Effects</Text>
              <div className="showcase-buttons mb-md">
                <Button 
                  variant="cannabis" 
                  effect="triple-leaf"
                >
                  Triple Leaf
                </Button>
                <Button 
                  variant="purple" 
                  effect="glow"
                >
                  Purple Glow
                </Button>
                <Button 
                  variant="gradient" 
                  effect="smoke"
                >
                  Smoke Effect
                </Button>
                <Button 
                  variant="gold" 
                  effect="shimmer"
                >
                  Gold Shimmer
                </Button>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">Sizes</Text>
              <div className="showcase-buttons mb-md">
                <Button variant="primary" size="lg">Large</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="xs">XSmall</Button>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">With Icons</Text>
              <div className="showcase-buttons mb-md">
                <Button 
                  variant="cannabis" 
                  icon={<LeafIcon />} 
                  iconPosition="left"
                >
                  With Icon Left
                </Button>
                <Button 
                  variant="cannabis" 
                  icon={<LeafIcon />} 
                  iconPosition="right"
                >
                  With Icon Right
                </Button>
                <Button 
                  variant="purple" 
                  rounded
                  icon={<LeafIcon />}
                >
                  Rounded
                </Button>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">States</Text>
              <div className="showcase-buttons">
                <Button variant="primary" disabled>Disabled</Button>
                <Button variant="cannabis" loading>Loading</Button>
                <Button variant="gradient" width="full">Full Width</Button>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="showcase-section">
          <Text variant="h2" className="mb-md">Cards</Text>
          <div className="showcase-cards">
            <Card className="mb-md">
              <CardHeader>
                <div>
                  <h3 className="card-title">Simple Card</h3>
                  <div className="card-subtitle">With header and body</div>
                </div>
              </CardHeader>
              <CardBody>
                <Text variant="body">This is a basic card with a header and body.</Text>
              </CardBody>
            </Card>

            <Card elevation="lg" className="mb-md">
              <CardHeader>
                <div>
                  <h3 className="card-title">Card with Footer</h3>
                  <div className="card-subtitle">Has larger shadow</div>
                </div>
              </CardHeader>
              <CardBody>
                <Text variant="body">This card has a header, body, and footer. It also has a larger shadow (elevation).</Text>
              </CardBody>
              <CardFooter>
                <Button variant="text" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Submit</Button>
              </CardFooter>
            </Card>

            <Card bordered elevation="none" className="mb-md">
              <CardBody padding="lg">
                <Text variant="h4" className="mb-sm">Bordered Card</Text>
                <Text variant="body">This card has a border instead of a shadow, and larger padding.</Text>
              </CardBody>
            </Card>
          </div>
        </div>

        <div className="showcase-section">
          <Text variant="h2" className="mb-md">Form Controls</Text>
          <Card className="mb-lg">
            <CardBody>
              <div className="showcase-form-grid">
                <div className="showcase-form-item">
                  <Text variant="h4" className="mb-sm">Input</Text>
                  <Input
                    label="Text Input"
                    placeholder="Enter some text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    helperText="This is a standard input field"
                  />
                  <Input
                    label="Error Input"
                    error={true}
                    errorText="This field has an error"
                  />
                </div>
                
                <div className="showcase-form-item">
                  <Text variant="h4" className="mb-sm">Checkbox</Text>
                  <Checkbox
                    label="Standard Checkbox"
                    checked={checkboxChecked}
                    onChange={(e) => setCheckboxChecked(e.target.checked)}
                  />
                  <Checkbox
                    label="Disabled Checkbox"
                    disabled
                  />
                  <Checkbox
                    label="Error Checkbox"
                    error
                  />
                </div>
                
                <div className="showcase-form-item">
                  <Text variant="h4" className="mb-sm">Toggle</Text>
                  <Toggle
                    label="Standard Toggle"
                    checked={toggleChecked}
                    onChange={setToggleChecked}
                  />
                  <Toggle
                    label="Disabled Toggle"
                    checked={true}
                    onChange={() => {}}
                    disabled
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="showcase-section">
          <Text variant="h2" className="mb-md">Badges</Text>
          <Card className="mb-lg">
            <CardBody>
              <Text variant="h4" className="mb-sm">Standard Variants</Text>
              <div className="showcase-badges mb-md">
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="light">Light</Badge>
                <Badge variant="dark">Dark</Badge>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">Cannabis-Themed Badges</Text>
              <div className="showcase-badges mb-md">
                <Badge variant="cannabis">Cannabis</Badge>
                <Badge variant="purple">Purple</Badge>
                <Badge variant="gold">Gold</Badge>
                <Badge variant="earth">Earth</Badge>
                <Badge variant="gradient">Gradient</Badge>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">SeshTracker Strain Types</Text>
              <div className="showcase-badges mb-md">
                <Badge className="badge-indica">Indica</Badge>
                <Badge className="badge-sativa">Sativa</Badge>
                <Badge className="badge-hybrid">Hybrid</Badge>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">SeshTracker Session Times</Text>
              <div className="showcase-badges mb-md">
                <Badge className="badge-morning">Morning</Badge>
                <Badge className="badge-afternoon">Afternoon</Badge>
                <Badge className="badge-evening">Evening</Badge>
                <Badge className="badge-night">Night</Badge>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">SeshTracker Effects</Text>
              <div className="showcase-badges mb-md">
                <Badge className="badge-effect badge-relaxed">Relaxed</Badge>
                <Badge className="badge-effect badge-energetic">Energetic</Badge>
                <Badge className="badge-effect badge-creative">Creative</Badge>
                <Badge className="badge-effect badge-sleepy">Sleepy</Badge>
                <Badge className="badge-effect badge-focused">Focused</Badge>
                <Badge className="badge-effect badge-happy">Happy</Badge>
                <Badge className="badge-effect badge-hungry">Hungry</Badge>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">SeshTracker Special Badges</Text>
              <div className="showcase-badges mb-md">
                <Badge className="badge-strain">Strain Type</Badge>
                <Badge className="badge-sesh">Session</Badge>
                <Badge className="badge-potency">THC 20%</Badge>
                <Badge className="badge-potency">CBD 5%</Badge>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">Outlined Badges</Text>
              <div className="showcase-badges mb-md">
                <Badge variant="primary" outlined>Primary</Badge>
                <Badge variant="cannabis" outlined>Cannabis</Badge>
                <Badge variant="purple" outlined>Purple</Badge>
                <Badge variant="gold" outlined>Gold</Badge>
                <Badge variant="gradient" outlined>Gradient</Badge>
              </div>
              
              <Text variant="h4" className="mb-sm mt-md">With Icons</Text>
              <div className="showcase-badges mb-md">
                <Badge variant="cannabis" leafIcon>With Leaf</Badge>
                <Badge variant="primary" rounded>Rounded</Badge>
                <Badge variant="cannabis" rounded leafIcon>Rounded Leaf</Badge>
                <Badge variant="purple" removable onRemove={() => alert('Badge removed!')}>Removable</Badge>
                <Badge
                  variant="primary"
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v4M12 16h.01" />
                    </svg>
                  }
                >
                  With Icon
                </Badge>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="showcase-section">
          <Text variant="h2" className="mb-md">Modal</Text>
          <Card className="mb-lg">
            <CardBody>
              <Button variant="cannabis" onClick={() => setIsModalOpen(true)}>Open Modal</Button>
              
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Example Modal"
                footer={
                  <div>
                    <Button variant="text" onClick={() => setIsModalOpen(false)} className="mr-sm">Cancel</Button>
                    <Button variant="cannabis" onClick={() => setIsModalOpen(false)}>Submit</Button>
                  </div>
                }
              >
                <Text variant="body">This is the content of the modal dialog. You can put any content here.</Text>
                <div className="mt-md">
                  <Input
                    label="Modal Input Example"
                    placeholder="Enter some text"
                  />
                </div>
              </Modal>
            </CardBody>
          </Card>
        </div>

        {/* 
        ====================================================
        ADVANCED COMPONENTS - HIDDEN FOR NOW
        ====================================================
        These components have been temporarily hidden to focus on basic UI elements.
        They are still available for use in the application when needed.
        Analytics: TrendChart, RadarChart, HeatmapChart, BarChart, TimelineChart
        User Interaction: RatingSlider, StrainLibrary, TagSelector, RichTextEditor, SessionWizard
        Live Session: SessionTimer, EffectTracker, SharingCard, CollaborativePanel, NotificationBanner
        */}
      </div>
    </ThemeProvider>
  );
};

export default ComponentShowcase; 