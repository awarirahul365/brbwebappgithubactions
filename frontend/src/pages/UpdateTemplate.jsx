import React, { useState } from 'react';
import { TextArea, Button, Bar, Label, Page } from '@ui5/webcomponents-react';
import axios from 'axios';
import Modal from 'react-modal';
import { Loadingcomponent } from '../Loading/Loadingcomponent';
const UpdateTemplate = () => {
    const [text, setText] = useState('');
    const [oldData, setOldData] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [loading,setLoading]=useState(false);
    const handleTextChange = (event) => {
        setText(event.target.value);
    };

    const handleUpdateTemplateSubmit = async () => {
        try {
            const response = await axios.post('https://brbticketingtool.azurewebsites.net/updatetemplate', { text });
            console.log(response.data);
            setText(response.data.text);
        } catch (error) {
            console.log("This is error", error);
        }
    };

    const handlePreviewOldTemplate = async () => {
        setLoading(true);
        try {
            const response = await axios.post('https://brbticketingtool.azurewebsites.net/oldtemplatepreview');
            console.log(response.data);
            setOldData(response.data);
            setShowPreview(true);
        } catch (error) {
            console.log("Error fetching old template", error);
        }
        finally{
            setLoading(false);
        }
    };

    const handleClosePreview = ()=>{
        setShowPreview(false);
        setOldData(null);
    };
    return (
        <div>
            <h1>Update Template</h1>
            <div>
                <TextArea
                    value={text}
                    onInput={handleTextChange}
                    style={{ width: '100%', height: '300px' }}
                />
            </div>
            <div>
                <Button
                    design="Default"
                    icon="employee"
                    onClick={handleUpdateTemplateSubmit}
                >
                    Update Template
                </Button>{' '}
                <Button
                    design="Default"
                    icon="employee"
                    onClick={handlePreviewOldTemplate}
                >
                    Preview Old Template
                </Button>
            </div>
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
                    showPreview && (
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
                                <pre style={{ whiteSpace: 'pre-wrap' }}>{oldData}</pre>
                            </Page>
                        </div>
                    )
                )}
            </Modal>
        </div>
    );
};

export default UpdateTemplate;
