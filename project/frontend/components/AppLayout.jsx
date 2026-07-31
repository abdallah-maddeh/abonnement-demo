import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AppLayout = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            background: '#F8FAFC'
        }}>
            <div style={{
                background: '#f8fafc',
                color: '#334155',
                textAlign: 'center',
                padding: '8px 16px',
                fontSize: '13px',
                borderBottom: '1px solid rgba(15, 23, 42, 0.08)'
            }}>
                🚀 DEMO VERSION - Les données affichées sont fictives.
            </div>
            <div style={{
                display: 'flex',
                flex: 1,
                overflow: 'hidden'
            }}>
                <Sidebar />
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}>
                    <Navbar />
                    <main style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '30px 40px'
                    }}>
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
