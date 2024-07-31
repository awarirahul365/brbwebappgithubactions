import React, { useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents-icons/dist/edit.js";
import "@ui5/webcomponents/dist/Card.js";
import "@ui5/webcomponents/dist/CardHeader.js";
import "@ui5/webcomponents/dist/Icon.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/StandardListItem.js";
import "@ui5/webcomponents/dist/Input.js";
import "@ui5/webcomponents-icons/dist/group.js";
import "@ui5/webcomponents/dist/TextArea.js";
import "@ui5/webcomponents/dist/features/InputElementsFormSupport.js";
import {
  Button,
  Label,
  BusyIndicator,
  Bar
} from '@ui5/webcomponents-react';
import { Loadingcomponent } from '../Loading/Loadingcomponent';
import { Page } from '@ui5/webcomponents-react';
import { useEffect } from 'react';
const CreateTicket = () => {
  /*const initialContent = `Title: SAP MIM BRB - Critical Support Ticket | MIM # | Sev-A SR#

  Your presence has been requested in the following MIM Bridge room:

  Major Incident for: ECS

  Incident description: <Provide a short and clean description which is very clear>

  SAP MIM #: <This is SAP internal MIM ID and will be used to map repair items if any with SAP records>

  Approved By: SAP MIM team

  Customer Impact: <Describe how the issue is impacting SAP business>

  Conference Room Dial-in Info: <optional>

  Conference Room Dial-in ID: <optional>

  Conference Room URL: Mandatory

  Parent support ticket #: <Sev-A support request ID for the impacted resource under its subscription ID>`;*/


  const [initialContent, setinitialContent] = useState(null);
  useEffect(() => {
    const fetchinitialdetails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/oldtemplatepreview');
        console.log(response.data);
        setinitialContent(response.data);
      }
      catch (error) {
        console.log("error")
      }
    };
    fetchinitialdetails();
  }, []);
  console.log(initialContent)
  const [formData, setFormData] = useState({
    azurecasenumber: '',
    subscriptionid: '',
    emailaddress: '',
    meetinglink: '',
    additionalcomments: initialContent,
  });



  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  //const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResponse, setSubmitResponse] = useState(null);
  const [showSubmitResponse, setShowSubmitResponse] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const sanitizeInput = (input) => {
    // Remove or replace invalid characters
    return input.replace(/[\u0000-\u001F\u007F<>]/g, '');
  };
  const handlePreview = async () => {
    setLoading(true);
    setShowPreview(true);
    try {
      const response = await axios.post('http://localhost:5000/preview', formData);
      setPreviewData(response.data);
      setShowPreview(true);
    } catch (error) {
      console.error('There was an error fetching the preview data!', error);
    } finally {
      setLoading(false);
    }
  };
  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };
  const handleSubmit = async () => {

    setLoading(true);
    setShowSubmitResponse(false);
    const sanitizedData = {
      ...formData,
      additionalcomments: sanitizeInput(formData.additionalcomments),
    };
    try {
      const response = await axios.post('http://localhost:5000/submit', sanitizedData);
      console.log(response.data)
      setSubmitResponse(response.data);
      setShowSubmitResponse(true);
      setTimeout(() => {
        setShowSubmitResponse(false);
        setSubmitResponse(null);
      }, 3000);
    } catch (error) {
      setSubmitResponse({ error: "There is error" });
      setShowSubmitResponse(true);
      setTimeout(() => {
        setShowSubmitResponse(false);
        setSubmitResponse(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create BRB Ticket</h2>
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
        <div>
          <ui5-label required>Azure Case Number: </ui5-label>
          <ui5-input name="azurecasenumber"
            value={formData.azurecasenumber}
            onInput={handleChange}
            onChange={handleChange}
            type="Text"
            required></ui5-input>
        </div>
        <div>
          <ui5-label required>Subscription ID: </ui5-label>
          <ui5-input
            name="subscriptionid"
            value={formData.subscriptionid}
            onInput={(e) => handleChange({ target: { name: 'subscriptionid', value: e.target.value } })}
            onChange={handleChange}
            type="Text"
            required
          />
        </div>
        <div>
          <ui5-label required>Email Address: </ui5-label>
          <ui5-input
            name="emailaddress"
            value={formData.emailaddress}
            onInput={handleChange}
            onChange={handleChange}
            type="Email"
            required
          />
        </div>
        <div>
          <ui5-label required>Meeting Link: </ui5-label>
          <ui5-textarea
            name="meetinglink"
            value={formData.meetinglink}
            onInput={handleChange}
            onChange={handleChange}
            type="Text"
            required
          ></ui5-textarea>
        </div>
        <div>
          <ui5-label htmlFor="prefilled-textarea" required>Additional Comments: </ui5-label>
          <ui5-textarea
            name="additionalcomments"
            value={initialContent}
            //onInput={handleChangeadditional}
            //onChange={handleChangeadditional}
            onInput={(e) => setFormData({ ...formData, additionalcomments: e.target.value })}
            onChange={(e) => setFormData({ ...formData, additionalcomments: e.target.value })}
            style={{ width: '100%', height: '200px' }}
            type="Text"
          ></ui5-textarea>
        </div>
        <div>
          <ui5-button type='submit' onClick={handleSubmit} >Submit</ui5-button>{' '}
          <ui5-button type='submit' onClick={handlePreview}>Preview</ui5-button>{' '}
        </div>
      </form>
      <Modal
        isOpen={showSubmitResponse}
        onRequestClose={() => { }}
        contentLabel="Submit Response"
        ariaHideApp={false}
        className="modal"
        overlayClassName="overlay"
      >
        {loading ? (
          <BusyIndicator
            active
            delay={1000}
            size="Medium"
          />
        ) : (
          submitResponse && (
            <div className="preview-card">
              <h3>Submit Response</h3>
              {submitResponse.error ? (
                <p>{submitResponse.error}</p>
              ) : (
                <>
                  <p>{submitResponse.data}</p>
                </>
              )}
            </div>
          )
        )}</Modal>
      <Modal
        isOpen={showPreview}
        onRequestClose={handleClosePreview}
        contentLabel="Preview Data"
        ariaHideApp={false}
        className="modal"
        overlayClassName="overlay"
      >
        {loading ? (
          <Loadingcomponent />
        ) : (
          previewData && (
            <div className='preview-card'>
              <Page
                backgroundDesign="Solid"
                footer={<Bar design="FloatingFooter" endContent={<><Button design="Positive" onClick={handleClosePreview}>Close Preview</Button></>} />}
                header={<Bar design="Header"><Label>Preview Data</Label></Bar>}
                style={{
                  height: '500px',
                  width: '800px'
                }}
              >
                <div>
                  <h3>Preview Data</h3>
                  <p><strong>Azure Case Number:</strong> {formData.azurecasenumber}</p>
                  <p><strong>Subscription ID:</strong> {formData.subscriptionid}</p>
                  <p><strong>Primary Email Address:</strong> {formData.emailaddress}</p>
                  <p><strong>Additional Email Address:</strong> {previewData.contactDetails.additionalEmailAddresses}</p>
                  <p><strong>Title:</strong> {previewData.title}</p>
                  <p><strong>Severity:</strong>{previewData.severity}</p>
                  <pre style={{ whiteSpace: 'pre-wrap' }}><strong>Description:</strong><span dangerouslySetInnerHTML={{ __html: previewData.description }} /></pre>
                  <p><strong>ServiceId:</strong> {previewData.serviceId}</p>
                </div>
              </Page>
            </div>
          )
        )}
      </Modal>
    </div>
  );
};

export default CreateTicket;
