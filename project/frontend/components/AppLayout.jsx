import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="app-shell">
            <div className="demo-strip">Mode démonstration · Les données affichées sont fictives.</div>
            <div className="shell-body">
                <Sidebar collapsed={sidebarCollapsed} open={sidebarOpen} />
                <div className="shell-content">
                    <Navbar onMenu={() => setSidebarOpen((value) => !value)} onCollapse={() => setSidebarCollapsed((value) => !value)} />
                    <main className="shell-main">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
