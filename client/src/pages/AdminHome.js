import React, { useState, useEffect } from 'react'; 
import axios from 'axios'; 
import { Layout, Menu, Dropdown, Button, Input, Tooltip, List, Space } from 'antd'; 
import { DownOutlined, PhoneOutlined, MailOutlined, EditOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'; 
import { Link } from 'react-router-dom'; 

const { Header, Content, Footer } = Layout;

const menu = (
  <Menu>
    <Menu.Item key="6">
      <a href="#announcements">Announcements</a>
    </Menu.Item>
    <Menu.Item key="7">
      <a href="#services">Services</a>
    </Menu.Item>
    <Menu.Item key="8">
      <a href="#links">Reference Links</a>
    </Menu.Item>
    <Menu.Item key="9">
      <a href="#timings">Timings</a>
    </Menu.Item>
    <Menu.Item key="10">
      <a href="#about">About</a>
    </Menu.Item>
    <Menu.Item key="11">
      <Link to="/">Logout</Link>
    </Menu.Item>
  </Menu>
);

const AdminHome = () => {
  const [isEditing, setIsEditing] = useState({
    announcements: false,
    services: false,
    links: false,
    timings: false,
    about: false,
  });

  const [announcements, setAnnouncements] = useState([]);
  const [services, setServices] = useState([]);
  const [links, setLinks] = useState([]);
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [newService, setNewService] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newTiming, setNewTiming] = useState('');
  const [newAbout, setNewAbout] = useState('');
  

  useEffect(() => {
    fetchAnnouncements();
    fetchServices();
    fetchLinks();
    fetchTiming();
    fetchAbout();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:8000/announcements');
      setAnnouncements(response.data);
    } catch (error) {
      console.error("There was an error fetching the announcements!", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get('http://localhost:8000/services');
      setServices(response.data);
    } catch (error) {
      console.error("There was an error fetching the services!", error);
    }
  };

  const fetchLinks = async () => {
    try {
      const response = await axios.get('http://localhost:8000/links');
      setLinks(response.data);
    } catch (error) {
      console.error("There was an error fetching the reference links!", error);
    }
  };

  const fetchTiming = async () => {
    try {
      const response = await axios.get('http://localhost:8000/timings');
      setNewTiming(response.data.text);  // Ensure response.data is a string or text
    } catch (error) {
      console.error("There was an error fetching the timings!", error);
    }
  };
  
  const fetchAbout = async () => {
    try {
      const response = await axios.get('http://localhost:8000/about');
      setNewAbout(response.data.text);  // Ensure response.data is a string or text
    } catch (error) {
      console.error("There was an error fetching the about!", error);
    }
  };
  

  const handleEditToggle = (section) => {
  setIsEditing(prev => {
    const newEditingState = { ...prev, [section]: !prev[section] };
    if (!newEditingState[section]) {
      window.location.reload(); // Refresh the page when editing is turned off
    }
    return newEditingState;
  });
};


  const handleAddItem = async (section) => {
    if (section === 'announcements' && !newAnnouncement.trim()) return;
    if (section === 'services' && !newService.trim()) return;
    if (section === 'links' && !newLink.trim()) return;

    try {
      const endpoint = section === 'announcements' ? 'announcements' : section === 'links' ? 'links' : 'services';
      const item = section === 'announcements' ? newAnnouncement : section === 'links' ? newLink : newService;
      const response = await axios.post(`http://localhost:8000/${endpoint}`, { text: item });
      if (section === 'announcements') {
        setAnnouncements([...announcements, { ...response.data, text: newAnnouncement }]);
        setNewAnnouncement('');
      } else if (section === 'services') {
        setServices([...services, { ...response.data, text: newService }]);
        setNewService('');
      } else if (section === 'links') {
        setLinks([...links, { ...response.data, text: newLink }]);
        setNewLink('');
      }
    } catch (error) {
      console.error(`There was an error adding the ${section}!`, error);
    }
  };

  const handleRemoveItem = async (section, id) => {
    try {
      const endpoint = section === 'announcements' ? 'announcements' : section === 'links' ? 'links' : 'services';
      await axios.delete(`http://localhost:8000/${endpoint}/${id}`);
      if (section === 'announcements') {
        setAnnouncements(announcements.filter(item => item._id !== id));
      } else if (section === 'services'){
        setServices(services.filter(item => item._id !== id));
      } else if (section === 'links'){
        setLinks(links.filter(item => item._id !== id));
      }
    } catch (error) {
      console.error(`There was an error deleting the ${section}!`, error);
    }
  };

  const handleInputChange = (section, index, event) => {
    const value = event.target.value;
    if (section === 'announcements') {
      const updatedAnnouncements = [...announcements];
      updatedAnnouncements[index].text = value;
      setAnnouncements(updatedAnnouncements);
    } else if (section === 'services'){
      const updatedServices = [...services];
      updatedServices[index].text = value;
      setServices(updatedServices);
    } else if (section === 'links'){
      const updatedLinks = [...links];
      updatedLinks[index].text = value;
      setLinks(updatedLinks);
    } else if (section === 'timings'){
      setNewTiming(value);
    } else if (section === 'about'){
      setNewAbout(value);
    }
  };

  const handleSaveChanges = async (section, id, text) => {
    try {
      const endpoint = section === 'announcements' ? 'announcements' : section === 'links' ? 'links' : 'services';
      await axios.put(`http://localhost:8000/${endpoint}/${id}`, { text });
    } catch (error) {
      console.error(`There was an error updating the ${section}!`, error);
    }
  };

  const handleSaveText = async (section) => {
    try {
      const endpoint = section === 'timings' ? 'timings/64c1be88a8233dbee508a4c6' : 'about/64c1be88a8233dbee508a4c7';
      const text = section === 'timings' ? newTiming : newAbout;
      await axios.put(`http://localhost:8000/${endpoint}`, { text });
      setIsEditing(prev => ({ ...prev, [section]: false }));
    } catch (error) {
      console.error(`There was an error updating the ${section}!`, error);
    }
  };


  const renderListSection = (section, data) => (
    <List
      bordered
      dataSource={data}
      renderItem={(item, index) => (
        <List.Item
          actions={[
            <Tooltip title="Remove">
              <Button
                type="link"
                icon={<span className="text-red-500"><DeleteOutlined /></span>}
                onClick={() => handleRemoveItem(section, item._id)}
                disabled={isEditing[section]}
              />
            </Tooltip>
          ]}
        >
          {isEditing[section] ? (
            <Input
              value={item.text}
              onChange={(event) => handleInputChange(section, index, event)}
              onBlur={() => handleSaveChanges(section, item._id, item.text)}
              placeholder={`Edit ${section}`}
            />
          ) : (
            item.text
          )}
        </List.Item>
      )}
    />
  );

  return (
    <Layout className="layout min-h-screen flex flex-col">
      <Header className="bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-md">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="text-2xl font-bold">Vanamala Clinic</div>
          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button className="bg-white text-black border-none hover:bg-teal-100" type="primary">Prescribe</Button>
            </Link>
            <Dropdown overlay={menu} trigger={['click']}>
              <a className="ant-dropdown-link text-white hover:text-teal-200" onClick={e => e.preventDefault()}>
                Menu <DownOutlined />
              </a>
            </Dropdown>
          </div>
        </div>
      </Header>
      <Content className="flex-1 p-8 bg-gray-50">
        <div className="site-layout-content">
          <section id="announcements" className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold text-teal-600">Announcements</h2>
              <div className="ml-auto flex items-center space-x-2">
                <Tooltip title="Edit">
                  <Button
                    type="link"
                    icon={<EditOutlined className="text-teal-600" />}
                    onClick={() => handleEditToggle('announcements')}
                  />
                </Tooltip>
                {isEditing.announcements && (
                  <>
                    <Tooltip title="Add Item">
                      <Button
                        type="link"
                        icon={<PlusOutlined className="text-teal-600" />}
                        onClick={() => handleAddItem('announcements')}
                      />
                    </Tooltip>
                    <Input
                      value={newAnnouncement}
                      onChange={(e) => setNewAnnouncement(e.target.value)}
                      placeholder="New announcement"
                      className="ml-2"
                    />
                  </>
                )}
              </div>
            </div>
            {renderListSection('announcements', announcements)}
          </section>
  
          <section id="services" className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold text-teal-600">Services</h2>
              <div className="ml-auto flex items-center space-x-2">
                <Tooltip title="Edit">
                  <Button
                    type="link"
                    icon={<EditOutlined className="text-teal-600" />}
                    onClick={() => handleEditToggle('services')}
                  />
                </Tooltip>
                {isEditing.services && (
                  <>
                    <Tooltip title="Add Item">
                      <Button
                        type="link"
                        icon={<PlusOutlined className="text-teal-600" />}
                        onClick={() => handleAddItem('services')}
                      />
                    </Tooltip>
                    <Input
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="New service"
                      className="ml-2"
                    />
                  </>
                )}
              </div>
            </div>
            {renderListSection('services', services)}
          </section>
  
          <section id="links" className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold text-teal-600">Reference Links</h2>
              <div className="ml-auto flex items-center space-x-2">
                <Tooltip title="Edit">
                  <Button
                    type="link"
                    icon={<EditOutlined className="text-teal-600" />}
                    onClick={() => handleEditToggle('links')}
                  />
                </Tooltip>
                {isEditing.links && (
                  <>
                    <Tooltip title="Add Item">
                      <Button
                        type="link"
                        icon={<PlusOutlined className="text-teal-600" />}
                        onClick={() => handleAddItem('links')}
                      />
                    </Tooltip>
                    <Input
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      placeholder="New link"
                      className="ml-2"
                    />
                  </>
                )}
              </div>
            </div>
            {renderListSection('links', links)}
          </section>
  
          <section id="timings" className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold text-teal-600">Timings</h2>
              <Tooltip title="Edit">
                <Button
                  type="link"
                  icon={<EditOutlined className="text-teal-600" />}
                  onClick={() => handleEditToggle('timings')}
                />
              </Tooltip>
            </div>
            {isEditing.timings ? (
              <Input.TextArea
                value={newTiming}
                onChange={(event) => handleInputChange('timings', null, event)}
                onBlur={() => handleSaveText('timings')}
                placeholder="Edit timings"
              />
            ) : (
              <p>{newTiming}</p>
            )}
          </section>
  
          <section id="about" className="mb-8 bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center mb-4">
              <h2 className="text-3xl font-bold text-teal-600">About</h2>
              <Tooltip title="Edit">
                <Button
                  type="link"
                  icon={<EditOutlined className="text-teal-600" />}
                  onClick={() => handleEditToggle('about')}
                />
              </Tooltip>
            </div>
            {isEditing.about ? (
              <Input.TextArea
                value={newAbout}
                onChange={(event) => handleInputChange('about', null, event)}
                onBlur={() => handleSaveText('about')}
                placeholder="Edit about information"
              />
            ) : (
              <p>{newAbout}</p>
            )}
          </section>
        </div>
      </Content>
      <Footer className="bg-gradient-to-r from-teal-400 to-teal-600 text-white py-8">
        <div className="container mx-auto flex justify-between items-start px-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold mb-2">Address</h2>
            <p>Vanamala Clinic, RBI Layout, 2nd Main, 5th Cross, JP Nagar, 7th Phase Bangalore-560078</p>
          </div>
          <div className="flex-1 flex flex-col items-end">
            <h2 className="text-lg font-bold mb-2">Contact Us</h2>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <MailOutlined />
                <span>vanamala457@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
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

export default AdminHome;
