// src/pages/LoginPage.js
import React, { useState } from 'react';
import { Button, Input, Layout, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import doctorSvg from '../images/doctor.svg'; // Adjust the path as needed
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; 

const { Header, Content } = Layout;

const LoginPage = () => {
  const navigate = useNavigate();
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [form] = Form.useForm();
  const [phoneNumber, setPhoneNumber] = useState('');
  const { login } = useAuth();

  const requestOtp = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone) {
        message.error('Please enter your phone number!');
        return;
      }
      // Make API call to request OTP
      const response = await axios.post('http://localhost:8000/request-otp', { phone });
      if (response.data.success) {
        message.success('OTP sent to your phone!');
        setIsOtpSent(true);
        setPhoneNumber(phone);
      } else {
        message.error(response.data.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      message.error('Failed to send OTP. Please try again.');
    }
  };

  const handleLogin = async () => {
    try {
      const enteredOtp = form.getFieldValue('otp');
      if (!enteredOtp) {
        message.error('Please enter the OTP!');
        return;
      }
      // Verify the OTP
      const response = await axios.post('http://localhost:8000/verify-otp', { phone: phoneNumber, otp: enteredOtp });
      if (response.data.success) {
        login(); // Set authentication state
        navigate('/adminhome'); // Redirect to admin home
      } else {
        message.error('Incorrect OTP');
      }
    } catch (error) {
      message.error('Failed to verify OTP. Please try again.');
    }
  };

  return (
    <Layout className="flex items-center justify-center min-h-screen bg-gradient-to-r from-teal-300 to-teal-600">
      <Header className="bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-4">
          <div className="text-xl font-bold">Vanamala Clinic</div>
          <div className="flex items-center space-x-4 ml-auto">
            <Link to="/">
              <Button className="bg-white text-black border-none hover:bg-teal-100" type="primary">Back Home</Button>
            </Link>
          </div>
        </div>
      </Header>
      <Content className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg border border-gray-200 flex flex-col items-center justify-center ">
        <img src={doctorSvg} alt="Doctor" className="w-48 h-48 mb-6" />
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-900">
          {isOtpSent ? 'Verify Your OTP' : 'Login'}
        </h2>
        <Form
          form={form}
          className="w-full"
          onFinish={isOtpSent ? handleLogin : requestOtp}
        >
          {!isOtpSent ? (
            <>
              <Form.Item
                name="phone"
                rules={[{ required: true, message: 'Please input your phone number!' }]}
              >
                <Input 
                  className="p-4 border-2 border-blue-400 rounded-lg mb-6"
                  placeholder="Phone Number" 
                />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-200 transition-colors"
                >
                  Request OTP
                </Button>
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="otp"
                rules={[{ required: true, message: 'Please input the OTP!' }]}
              >
                <Input 
                  className="p-4 border-2 border-green-400 rounded-lg mb-6"
                  placeholder="OTP" 
                  type="text" 
                  autoComplete="one-time-code" 
                />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="w-full py-3 bg-teal-600 text-white rounded-lg shadow-md hover:bg-teal-200 transition-colors"
                >
                  Verify OTP
                </Button>
              </Form.Item>
              <Form.Item>
                <Button 
                  type="link" 
                  onClick={requestOtp} 
                  className="text-blue-500 hover:text-blue-700"
                >
                  Resend OTP
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Content>
    </Layout>
  );
};

export default LoginPage;
