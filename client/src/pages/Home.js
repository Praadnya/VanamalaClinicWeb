import React, { useState, useEffect } from 'react';
import { Layout, Button, Menu, Dropdown, Alert, Typography } from 'antd';
import { DownOutlined, PhoneOutlined, MailOutlined, AppstoreAddOutlined, CalendarOutlined, InfoCircleOutlined, LinkOutlined, BellOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Home.css';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const menu = (
  <Menu>
    <Menu.Item key="2">
      <a href="#services">Services</a>
    </Menu.Item>
    <Menu.Item key="3">
      <a href="#timings">Timings</a>
    </Menu.Item>
    <Menu.Item key="4">
      <a href="#about">About</a>
    </Menu.Item>
    <Menu.Item key="5">
      <a href="#references">Reference Links</a>
    </Menu.Item>
    <Menu.Item key="1">
      <Link to="/login">Admin Login</Link>
    </Menu.Item>
  </Menu>
);

const Home = () => {
  const [about, setAbout] = useState('');
  const [timings, setTimings] = useState('');
  const [services, setServices] = useState([]);
  const [referenceLinks, setReferenceLinks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/about')
      .then(response => response.json())
      .then(data => setAbout(data.text))
      .catch(error => console.error('Error fetching about:', error));

    fetch('http://localhost:8000/timings')
      .then(response => response.json())
      .then(data => setTimings(data.text))
      .catch(error => console.error('Error fetching timings:', error));

    fetch('http://localhost:8000/services')
      .then(response => response.json())
      .then(data => setServices(data))
      .catch(error => console.error('Error fetching services:', error));

    fetch('http://localhost:8000/links')
      .then(response => response.json())
      .then(data => setReferenceLinks(data))
      .catch(error => console.error('Error fetching reference links:', error));

    fetch('http://localhost:8000/announcements')
      .then(response => response.json())
      .then(data => setAnnouncements(data))
      .catch(error => console.error('Error fetching announcements:', error));
  }, []);

  return (
    <Layout className="layout min-h-screen flex flex-col">
      <Header className="bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-4 py-4">
          <div className="text-xl font-bold">Vanamala Clinic</div>
          <div className="flex items-center space-x-4 ml-auto">
            <Dropdown overlay={menu} trigger={['click']}>
              <a className="ant-dropdown-link text-white font-bold text-xl hover:text-teal-200" onClick={e => e.preventDefault()}>
                Menu <DownOutlined />
              </a>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Content className="mt-20 sm:p-8 md:p-12 lg:p-16 xl:p-20 flex-grow">
        <div className="container mx-auto">
          <section id="announcements" className="py-2 px-6 bg-gray-100 rounded-lg shadow-lg shadow-teal-500 mb-8">
            <div className="flex items-center mb-4">
              <BellOutlined className="text-teal-500 text-2xl md:text-3xl mr-4" />
              <Title level={2} className="text-xl md:text-2xl font-bold">Announcements</Title>
            </div>
            {announcements.map(announcement => (
              <Alert
                key={announcement._id}
                message={announcement.title}
                description={announcement.text}
                type="info"
                showIcon
                className="mb-4"
                style={{ borderRadius: '8px' }}
              />
            ))}
          </section>
          <section id="services" className="p-6 bg-gray-100 rounded-lg shadow-lg shadow-teal-500 mb-8">
            <div className="flex items-center mb-4">
              <AppstoreAddOutlined className="text-teal-500 text-2xl md:text-3xl mr-4" />
              <Title level={2} className="text-xl md:text-2xl font-bold">Services</Title>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              {services.map(service => (
                <li key={service._id} className="text-base md:text-lg">{service.text}</li>
              ))}
            </ul>
          </section>
          <section id="timings" className="p-6 bg-gray-100 rounded-lg shadow-lg shadow-teal-500 mb-8">
            <div className="flex items-center mb-4">
              <CalendarOutlined className="text-teal-500 text-2xl md:text-3xl mr-4" />
              <Title level={2} className="text-xl md:text-2xl font-bold">Timings</Title>
            </div>
            <p className="text-base md:text-lg">{timings}</p>
          </section>
          <section id="about" className="p-6 bg-gray-100 rounded-lg shadow-lg shadow-teal-500 mb-8">
            <div className="flex items-center mb-4">
              <InfoCircleOutlined className="text-teal-500 text-2xl md:text-3xl mr-4" />
              <Title level={2} className="text-xl md:text-2xl font-bold">About</Title>
            </div>
            <p className="text-base md:text-lg">{about}</p>
          </section>
          <section id="references" className="p-6 bg-gray-100 rounded-lg shadow-lg shadow-teal-500 mb-8">
            <div className="flex items-center mb-4">
              <LinkOutlined className="text-teal-500 text-2xl md:text-3xl mr-4" />
              <Title level={2} className="text-xl md:text-2xl font-bold">Reference Links</Title>
            </div>
            <ul className="list-disc pl-5 space-y-2">
              {referenceLinks.map(link => (
                <li key={link._id}>
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline text-base md:text-lg">{link.text}</a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </Content>
      <Footer className="bg-gradient-to-r from-teal-400 to-teal-600 text-white py-8" >
        <div className="container mx-auto flex flex-wrap justify-between items-start ">
          <div className="flex-1" style={{maxWidth:'30%'}}>
            <h2 className="text-lg font-bold mb-2">Address</h2>
            <p>
              <a
            href="https://maps.app.goo.gl/6kxrqaaGdwPPJ2Ey5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline hover:text-gray-300"
              >
              Vanamala Clinic, RBI Layout, 2nd Main, 5th Cross, JP Nagar, 7th Phase Bangalore-560078
              </a>
            </p>
          </div>
          <div className="flex-1 min-w-[5%] flex flex-col px-2 " style={{position:'absolute', right:'5%'}}>
            <h2 className="text-lg font-bold mb-2">Contact Us</h2>
            <div className="flex flex-col space-y-2 ">
              <div className="flex items-center space-x-2">
                <MailOutlined />
                <span>vanamala457@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2" >
                <PhoneOutlined />
                <span>+91 9242201248</span>
              </div>
            </div>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default Home;
