import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './/components/Sidebar';
import CreateTicket from './pages/CreateTicket';
import ViewHistory from './pages/ViewHistory';
import './App.css'; // Import the CSS for styling
import UpdateTemplate from './pages/UpdateTemplate';
import { QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient=new QueryClient();

function App() {
    return (
        <QueryClientProvider client={queryClient}>
        <Router>
            <div className="App">
                <Header />
                <div className="main-content">
                    <Sidebar />
                    <div className="content">
                        <Routes>
                            <Route path="/create-ticket" element={<CreateTicket />} />
                            <Route path="/view-history" element={<ViewHistory />} />
                            <Route path='/update-template' element={<UpdateTemplate/>}/>
                            <Route path="/" element={<CreateTicket />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
        </QueryClientProvider>
    );
}
export default App;
