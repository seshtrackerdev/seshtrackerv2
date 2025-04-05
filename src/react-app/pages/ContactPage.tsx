import React, { useState } from 'react';
import './ContactPage.css'; // Keep or create specific styles if needed
import '../components/LandingPage.css'; // Inherit base styles/theme vars from components dir

// Icons (simple placeholders, consider using an icon library like react-icons)
const BusinessIcon = () => <span>🏢</span>; // Placeholder
const BugIcon = () => <span>🐞</span>; // Placeholder
const GeneralIcon = () => <span>✉️</span>; // Placeholder

// Define types for form state
interface BugReportFormState {
  email: string;
  category: string;
  description: string;
}

interface GeneralInquiryFormState {
  email: string;
  category: string;
  subject: string;
  message: string;
}

type ActiveTab = 'business' | 'bug' | 'general';

// --- Reusable Form Field Components (for better styling consistency) ---
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}
const FormInput: React.FC<FormInputProps> = ({ label, id, ...props }) => (
  <div className="mb-5">
    <label htmlFor={id} className="block text-sm font-medium text-color-secondary mb-2">
      {label}
    </label>
    <input
      id={id}
      {...props}
      className={`form-input-v6 w-full px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 rounded-lg border border-[var(--border-color)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ease-in-out shadow-sm hover:border-[var(--text-secondary)]/50 ${props.className}`}
    />
  </div>
);

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  id: string;
}
const FormTextarea: React.FC<FormTextareaProps> = ({ label, id, ...props }) => (
  <div className="mb-6">
    <label htmlFor={id} className="block text-sm font-medium text-color-secondary mb-2">
      {label}
    </label>
    <textarea
      id={id}
      rows={5}
      {...props}
      className={`form-input-v6 w-full px-4 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 rounded-lg border border-[var(--border-color)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ease-in-out shadow-sm hover:border-[var(--text-secondary)]/50 ${props.className}`}
    />
  </div>
);

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  children: React.ReactNode;
}
const FormSelect: React.FC<FormSelectProps> = ({ label, id, children, ...props }) => (
  <div className="mb-5 relative">
    <label htmlFor={id} className="block text-sm font-medium text-color-secondary mb-2">
      {label}
    </label>
    <div className="relative">
      <select
        id={id}
        {...props}
        className={`form-input-v6 form-select w-full pl-4 pr-10 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)] focus:border-transparent focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-200 ease-in-out appearance-none shadow-sm hover:border-[var(--text-secondary)]/50 ${props.className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[var(--text-secondary)]">
         <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
      </div>
    </div>
  </div>
);
// --- End Form Field Components ---

const ContactPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('general'); // Default to general
  const [bugReport, setBugReport] = useState<BugReportFormState>({ email: '', category: '', description: '' });
  const [generalInquiry, setGeneralInquiry] = useState<GeneralInquiryFormState>({ email: '', category: '', subject: '', message: '' });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleBugReportChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBugReport({ ...bugReport, [e.target.name]: e.target.value });
  };

  const handleGeneralInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setGeneralInquiry({ ...generalInquiry, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (type: 'bug' | 'general', formData: any) => {
    // Reset status on new submission attempt if previous error/success shown
    if (submissionStatus === 'success' || submissionStatus === 'error') {
        setSubmissionStatus('idle');
        setSubmissionMessage('');
    }
    
    // Check if category is selected for forms requiring it
    if ((type === 'bug' || type === 'general') && !formData.category) {
        setSubmissionStatus('error');
        setSubmissionMessage('Please select a category for your inquiry.');
        return; // Prevent submission
    }

    setSubmissionStatus('submitting');
    console.log(`Submitting ${type} report:`, formData); // Includes category now

    // --- BACKEND INTEGRATION NEEDED --- 
    // TODO: Replace console.log with an API call to your backend endpoint
    // Target emails based on type:
    // Bug Reports -> reports@sesh-tracker.com
    // General Inquiry -> contact@sesh-tracker.com
    // Example:
    // try {
    //   const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ type, ...formData }),
    //   });
    //   if (!response.ok) throw new Error('Network response was not ok');
    //   setSubmissionStatus('success');
    //   setSubmissionMessage('Your message has been sent successfully!');
    //   // Optionally reset forms
    //   if (type === 'bug') setBugReport({ email: '', category: '', description: '' });
    //   else setGeneralInquiry({ email: '', category: '', subject: '', message: '' });
    // } catch (error) {
    //   console.error('Submission Error:', error);
    //   setSubmissionStatus('error');
    //   setSubmissionMessage('Failed to send message. Please try again later or use the email link.');
    // }
    
    // Simulate network delay and success/error for demonstration
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    // Simulate success for now
    setSubmissionStatus('success');
    setSubmissionMessage('Your message has been sent successfully! (Simulated)');
    if (type === 'bug') setBugReport({ email: '', category: '', description: '' });
    else setGeneralInquiry({ email: '', category: '', subject: '', message: '' });
    // Remove simulation and uncomment try/catch block when backend is ready
  };

  // Helper function for tab classes
  const getTabClass = (tabName: ActiveTab): string => {
    // Base class: thicker border applied universally initially
    const baseClass = "contact-tab flex flex-1 items-center justify-center gap-2 px-3 sm:px-4 py-3 font-medium rounded-t-lg cursor-pointer transition-all duration-200 border-b-[3px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 text-center";
    
    if (activeTab === tabName) {
      let activeColorClass = '';
      // Use darker, more solid background for active; keep bright text & border
      switch (tabName) {
        case 'business': activeColorClass = 'border-teal-400 text-teal-200 bg-teal-800 hover:bg-teal-700 focus-visible:ring-teal-400'; break;
        case 'bug':      activeColorClass = 'border-red-400 text-red-200 bg-red-800 hover:bg-red-700 focus-visible:ring-red-400'; break;
        case 'general':  activeColorClass = 'border-blue-400 text-blue-200 bg-blue-800 hover:bg-blue-700 focus-visible:ring-blue-400'; break;
      }
      return `${baseClass} ${activeColorClass}`;
    } else {
      // Make inactive tabs duller, slight text brightening on hover
      return `${baseClass} border-transparent text-gray-500 hover:text-gray-400 focus-visible:ring-indigo-400`; 
    }
  };

  return (
    // Use landing page container and let Header control theme via body class
    <div className="contact-page-container flex flex-col min-h-screen bg-background text-color-primary">
      <main className="main-content-v6 flex-grow pt-20 pb-12 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold heading-gradient mb-3">
              Get in Touch
            </h1>
            <p className="text-lg md:text-xl text-color-secondary">
              Select the reason for your inquiry below.
            </p>
          </header>

          {/* Tab Navigation - Restoring original getTabClass */}
          <div className="flex mb-0 border-b border-gray-700 justify-center">
            <button 
              className={getTabClass('business')} 
              onClick={() => setActiveTab('business')}
            >
              <BusinessIcon /> Business
            </button>
            <button 
              className={getTabClass('bug')} 
              onClick={() => setActiveTab('bug')}
            >
              <BugIcon /> Bug Report
            </button>
            <button 
              className={getTabClass('general')} 
              onClick={() => setActiveTab('general')}
            >
              <GeneralIcon /> General
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="tab-content bg-elevated p-6 sm:p-8 rounded-b-lg shadow-xl min-h-[400px]">
            
            {/* Business Inquiries Content */}
            {activeTab === 'business' && (
              <div className="tab-pane animate-fade-in flex flex-col items-center justify-center h-full">
                 <h2 className="text-2xl font-semibold text-teal-400 mb-4 text-center">Business Inquiries</h2>
                 <p className="text-color-secondary mb-6 text-center max-w-md">
                   For partnerships, advertising, or other business proposals, please email us directly using the button below.
                 </p>
                 {/* Restore original button styles */}
                 <a
                   href="mailto:business@sesh-tracker.com?subject=Business%20Inquiry"
                   className="cta-button inline-block bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-8 rounded transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-400 focus-visible:ring-offset-gray-800"
                 >
                   Email Business Team
                 </a>
              </div>
            )}

            {/* Bug Report Form Content */}
            {activeTab === 'bug' && (
              <div className="tab-pane animate-fade-in">
                <h2 className="text-2xl font-semibold text-red-400 mb-6 text-center">Report a Bug</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit('bug', bugReport); }}>
                  <FormSelect
                    label="Bug Category *"
                    id="bug-category"
                    name="category"
                    value={bugReport.category}
                    onChange={handleBugReportChange}
                    required
                    className="focus:ring-red-500"
                  >
                    <option value="" disabled>Select a category...</option>
                    <option value="ui">UI/Visual Glitch</option>
                    <option value="functionality">Functionality Issue</option>
                    <option value="performance">Performance Problem</option>
                    <option value="login">Login/Authentication</option>
                    <option value="other">Other</option>
                  </FormSelect>
                  <FormInput
                    label="Your Email (Optional)"
                    type="email"
                    id="bug-email"
                    name="email"
                    placeholder="you@example.com"
                    value={bugReport.email}
                    onChange={handleBugReportChange}
                    className="focus:ring-red-500"
                  />
                  <FormTextarea
                    label="Describe the Bug *"
                    id="bug-description"
                    name="description"
                    placeholder="Please provide details about the bug, including steps to reproduce it."
                    value={bugReport.description}
                    onChange={handleBugReportChange}
                    required
                    className="focus:ring-red-500"
                  />

                   {/* Submission Status */}
                   {submissionStatus !== 'idle' && (
                    <div className={`mt-4 mb-4 p-3 rounded-md text-sm ${submissionStatus === 'success' ? 'bg-green-900/50 text-green-300' : submissionStatus === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'}`}>
                      {submissionMessage}
                    </div>
                  )}

                  {/* Restore original button styles */}
                  <div className="text-center mt-6">
                    <button
                       type="submit"
                       disabled={submissionStatus === 'submitting'}
                       className="cta-button bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-6 rounded transition duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-400 focus-visible:ring-offset-gray-800"
                    >
                       {submissionStatus === 'submitting' ? 'Submitting...' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* General Inquiry Form Content */}
            {activeTab === 'general' && (
              <div className="tab-pane animate-fade-in">
                 <h2 className="text-2xl font-semibold text-blue-400 mb-6 text-center">General Inquiry</h2>
                 <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit('general', generalInquiry); }}>
                   <FormSelect
                      label="Inquiry Category *"
                      id="general-category"
                      name="category"
                      value={generalInquiry.category}
                      onChange={handleGeneralInquiryChange}
                      required
                      className="focus:ring-blue-500"
                   >
                      <option value="" disabled>Select a category...</option>
                      <option value="feedback">Feedback/Suggestions</option>
                      <option value="feature_request">Feature Request</option>
                      <option value="account">Account Question</option>
                      <option value="other">Other</option>
                   </FormSelect>
                   <FormInput
                     label="Your Email *"
                     type="email"
                     id="general-email"
                     name="email"
                     placeholder="you@example.com"
                     value={generalInquiry.email}
                     onChange={handleGeneralInquiryChange}
                     required
                     className="focus:ring-blue-500"
                   />
                   <FormInput
                     label="Subject *"
                     type="text"
                     id="general-subject"
                     name="subject"
                     placeholder="Briefly describe your inquiry"
                     value={generalInquiry.subject}
                     onChange={handleGeneralInquiryChange}
                     required
                     className="focus:ring-blue-500"
                   />
                   <FormTextarea
                     label="Your Message *"
                     id="general-message"
                     name="message"
                     placeholder="How can we help you?"
                     value={generalInquiry.message}
                     onChange={handleGeneralInquiryChange}
                     required
                     className="focus:ring-blue-500"
                   />

                    {/* Submission Status */}
                    {submissionStatus !== 'idle' && (
                     <div className={`mt-4 mb-4 p-3 rounded-md text-sm ${submissionStatus === 'success' ? 'bg-green-900/50 text-green-300' : submissionStatus === 'error' ? 'bg-red-900/50 text-red-300' : 'bg-blue-900/50 text-blue-300'}`}>
                       {submissionMessage}
                     </div>
                   )}

                   {/* Restore original button styles */}
                   <div className="text-center mt-6">
                     <button
                       type="submit"
                       disabled={submissionStatus === 'submitting'}
                       className="cta-button bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded transition duration-300 w-full disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-400 focus-visible:ring-offset-gray-800"
                     >
                       {submissionStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                     </button>
                   </div>
                 </form>
              </div>
            )}

          </div> {/* End Tab Content */} 
        </div>
      </main>

       {/* Simple Footer (Optional) */}
       <footer className="text-center py-4 text-xs text-color-secondary">
           &copy; {new Date().getFullYear()} Sesh-Tracker.com - All Rights Reserved
       </footer>
    </div>
  );
};

export default ContactPage; 