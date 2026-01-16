import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import './App.css';
import { AuthProvider } from "./context/AuthContext";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import SendMoney from "./pages/SendMoney";
import AddFunds from "./pages/AddFunds";
import Rewards from "./pages/Rewards";
import TransactionPage from "./pages/TransactionPage";
import Layout from "./components/Layout"; 
import HomePage from "./pages/Home";
import MyProfile from "./pages/MyProfile";

function App() {
  return (
    <div className="App">
      <AuthProvider> {/* WRAP WITH THIS */}
      <Router>
        <Routes>
          {/* Public routes without layout */}
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<HomePage />} />
          
          {/* Protected routes with layout - JUST WRAP EACH WITH ProtectedRoute */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute> {/* ADD THIS */}
                <Dashboard />
              </ProtectedRoute> /* ADD THIS */
            } 
          /> 
          
          <Route 
            path="/send-money" 
            element={
              <ProtectedRoute> {/* ADD THIS */}
                <Layout 
                  showBackButton={true}
                  showQuickActions={true}
                >
                  <SendMoney />
                </Layout>
              </ProtectedRoute> /* ADD THIS */
            } 
          /> 

          <Route 
            path="/profile" 
            element={
              <ProtectedRoute> {/* ADD THIS */}
                <Layout 
                  title="My Profile"
                  subtitle="Manage your account settings"
                  showBackButton={true}
                  showQuickActions={true}
                >
                  <MyProfile />
                </Layout>
              </ProtectedRoute> /* ADD THIS */
            } 
          />
          
          <Route 
            path="/add-funds" 
            element={
              <ProtectedRoute> {/* ADD THIS */}
                <Layout 
                  showBackButton={true}
                  showQuickActions={true}
                >
                  <AddFunds />
                </Layout>
              </ProtectedRoute> /* ADD THIS */
            } 
          /> 
          
          <Route 
            path="/rewards" 
            element={
              <ProtectedRoute> {/* ADD THIS */}
                <Layout 
                  showBackButton={true}
                  showQuickActions={true}
                >
                  <Rewards />
                </Layout>
              </ProtectedRoute> /* ADD THIS */
            } 
          /> 
          
          <Route 
            path="/transactions" 
            element={
              <ProtectedRoute> {/* ADD THIS */}
                <Layout 
                  showBackButton={true}
                  showQuickActions={true}
                >
                  <TransactionPage />
                </Layout>
              </ProtectedRoute> /* ADD THIS */
            } 
          /> 
        </Routes>
      </Router>
      </AuthProvider>
    </div>
  );
}

export default App;
