import React, { useState } from 'react';
import { Steps, Form, DatePicker, Table, Typography, Select, Divider, Layout, Button, Input, Space } from 'antd';
import { UserOutlined, FileTextOutlined, FilePdfOutlined } from '@ant-design/icons';

import { Link } from 'react-router-dom'; 
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import headerImage from '../images/header-image.png'; // Path to your header image
import footerImage from '../images/footer-image.png'; // Path to your footer image

const { Header } = Layout;
const { Step } = Steps;
const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;


const AdminPage = () => {
  const [current, setCurrent] = useState(0);
  const [form] = Form.useForm();
  const [prescriptionData, setPrescriptionData] = useState([]);
  const navigate = useNavigate();

  const handleAddRow = () => {
    const newData = [...prescriptionData, { key: Date.now(), medicineName: '', frequency: '', numberOfDays: '', specialInstructions: '' }];
    setPrescriptionData(newData);
  };

  const handleDelete = (key) => {
    const newData = prescriptionData.filter(item => item.key !== key);
    setPrescriptionData(newData);
  };

  const handleChange = (e, key, field) => {
    const newData = prescriptionData.map(item => {
      if (item.key === key) {
        return { ...item, [field]: e.target.value };
      }
      return item;
    });
    setPrescriptionData(newData);
  };

  const handleNext = () => {
    form.validateFields()
      .then(() => {
        setCurrent(current + 1);
      })
      .catch((errorInfo) => {
        console.log('Validation Failed:', errorInfo);
      });
  };

  const handlePrev = () => {
    setCurrent(current - 1);
  };

  const handleNewPatient = () => {
    form.resetFields();
    setPrescriptionData([]);
    setCurrent(0);
  };
  

  const handleDownloadPDF = () => {
    const name = form.getFieldValue('name') || '';
    const dob = form.getFieldValue('dob');
    const gender = form.getFieldValue('gender') || '';
    const phone = form.getFieldValue('phone') || '';
    const mode = form.getFieldValue('mode') || '';
    const currentComplaints = form.getFieldValue('currentComplaints') || '';
    const diagnosis = form.getFieldValue('diagnosis') || '';
    const treatmentData = (prescriptionData || []).map(item => ({
        medicineName: item.medicineName || '',
        frequency: item.frequency || '',
        numberOfDays: item.numberOfDays || '',
        specialInstructions: item.specialInstructions || ''
    }));
    const investigations = form.getFieldValue('investigations') || '';
    const dietAdvice = form.getFieldValue('dietAdvice') || '';
    const exerciseAdvice = form.getFieldValue('exerciseAdvice') || '';
    const specialAdvice = form.getFieldValue('specialAdvice') || '';
    const reviewDate = form.getFieldValue('reviewDate')?.format('DD-MM-YYYY') || '';

    const dobDate = dob ? new Date(dob) : new Date();
    const age = dob ? new Date().getFullYear() - dobDate.getFullYear() : '';

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;

    // Add header image
    pdf.addImage(headerImage, 'JPEG', 0, 0, pageWidth, 50);

    // Utility function for adding text with wrapping
    const addText = (text, x, y, maxWidth, isBold = false) => {
        pdf.setFontSize(10);
        if (isBold) pdf.setFont('helvetica', 'bold');
        const lines = pdf.splitTextToSize(text, maxWidth);
        lines.forEach((line, index) => {
            if (y + (index * 10) > pageHeight - 30) { // Check if y exceeds the page height
                pdf.addPage();
                y = 60; // Reset y position to top of the new page
                pdf.addImage(headerImage, 'JPEG', 0, 0, pageWidth, 50); // Add header image to new page
            }
            pdf.text(line, x, y + (index * 10));
        });
        pdf.setFont('helvetica', 'normal'); // Reset font to normal
        return y + (lines.length * 10);
    };

    let y = 60;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    y = addText('Personal Details:', 10, y, pageWidth - 20, true);
    y += 1;

    const fieldWidth = (pageWidth - 20) / 3;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y = addText(` ${name}`, 10, y, fieldWidth);
    y = addText(` ${dob ? `${age}yrs` : ''} /  ${gender}`, 10, y, fieldWidth * 2);

    y += 5;

    pdf.setFontSize(15);
    pdf.setFont('helvetica', 'bold');
    y = addText('Consultation:', 10, y, pageWidth - 20, true);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    y = addText('Mode :', 10, y, pageWidth - 20, true);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    y = addText(mode, fieldWidth - 40, y-10, pageWidth - 20);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    y += 2;
    if (currentComplaints) {
        y = addText('Current Complaints:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        y = addText(currentComplaints, 10, y, pageWidth - 20);
    }

    if (diagnosis) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Diagnosis:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        y = addText(diagnosis, 10, y, pageWidth - 20);
    }

    if (treatmentData.length > 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Treatment:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        pdf.autoTable({
            startY: y,
            head: [['Medicine Name', 'Frequency', 'Number of Days', 'Special Instructions']],
            body: treatmentData.map(item => [
                item.medicineName,
                item.frequency,
                item.numberOfDays,
                item.specialInstructions
            ]),
            margin: { top: 10 },
            styles: { fontSize: 10 },
            headStyles: { fillColor: [22, 160, 133] },
        });

        y = pdf.autoTable.previous.finalY + 10;
    }

    if (investigations) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Investigations:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        y = addText(investigations, 10, y, pageWidth - 20);
    }

    if (dietAdvice) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Diet Advice:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        y = addText(dietAdvice, 10, y, pageWidth - 20);
    }

    if (exerciseAdvice) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Exercise Advice:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        y = addText(exerciseAdvice, 10, y, pageWidth - 20);
    }

    if (specialAdvice) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Special Advice:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        y = addText(specialAdvice, 10, y, pageWidth - 20);
    }

    if (reviewDate) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Review Date:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        y = addText(reviewDate, fieldWidth-30, y-10, pageWidth - 20);
        
    }

    // Add footer image
    pdf.addImage(footerImage, 'JPEG', pageWidth - 40, pageHeight - 30, 30, 20);

    const formattedDate = new Date().toISOString().split('T')[0];
    const fileName = `${name.replace(/ /g, '_')}_${formattedDate}.pdf`;
    pdf.save(fileName);
};


  
  

  const steps = [
    {
      title: 'Personal Details',
      icon: <UserOutlined />,
      content: (
        <div style={{ padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
          <Form form={form} layout="vertical">
            <Form.Item name="name" label="Name" rules={[{ required: true, message: 'This field cannot be left empty' }]}>
              <Input />
            </Form.Item>
            <Form.Item 
              name="phone" 
              label="Phone Number" 
              rules={[
                { required: true, message: 'This field cannot be left empty' },
                { pattern: /^[0-9]{10}$/, message: 'Phone number must be 10 digits!' }
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="dob" label="Date of Birth" rules={[{ required: true, message: 'This field cannot be left empty' }]}>
              <DatePicker disabledDate={currentDate => currentDate.isAfter(moment())} />
            </Form.Item>
            <Form.Item name="gender" label="Gender" rules={[{ required: true, message: 'This field cannot be left empty' }]}>
              <Select placeholder="Select gender">
                <Option value="male">Male</Option>
                <Option value="female">Female</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      title: 'Prescription',
      icon: <FileTextOutlined />,
      content: (
        <div style={{ padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
          <Form form={form} layout="vertical">
            <Form.Item 
              name="mode" 
              label="Mode" 
              rules={[{ required: true, message: 'This field cannot be left empty' }]}
            >
              <Select placeholder="Select mode">
                <Option value="online">Online</Option>
                <Option value="offline">Offline</Option>
              </Select>
            </Form.Item>
            <Form.Item name="currentComplaints" label="Current Complaints">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="diagnosis" label="Diagnosis">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="treatment" label="Treatment">
              <Table
                dataSource={prescriptionData}
                columns={[
                  { 
                    title: 'Medicine Name', 
                    dataIndex: 'medicineName', 
                    key: 'medicineName',
                    render: (_, record) => (
                      <Input 
                        value={record.medicineName} 
                        onChange={e => handleChange(e, record.key, 'medicineName')} 
                      />
                    )
                  },
                  { 
                    title: 'Frequency', 
                    dataIndex: 'frequency', 
                    key: 'frequency',
                    render: (_, record) => (
                      <Input 
                        value={record.frequency} 
                        onChange={e => handleChange(e, record.key, 'frequency')} 
                      />
                    )
                  },
                  { 
                    title: 'Number of Days', 
                    dataIndex: 'numberOfDays', 
                    key: 'numberOfDays',
                    render: (_, record) => (
                      <Input 
                        type="number" 
                        min={1} 
                        value={record.numberOfDays} 
                        onChange={e => handleChange(e, record.key, 'numberOfDays')} 
                      />
                    )
                  },
                  { 
                    title: 'Special Instructions', 
                    dataIndex: 'specialInstructions', 
                    key: 'specialInstructions',
                    render: (_, record) => (
                      <Input 
                        value={record.specialInstructions} 
                        onChange={e => handleChange(e, record.key, 'specialInstructions')} 
                      />
                    )
                  },
                  {
                    title: 'Actions',
                    key: 'actions',
                    render: (_, record) => (
                      <Space size="middle">
                        <Button onClick={() => handleDelete(record.key)}>Delete</Button>
                      </Space>
                    ),
                  },
                ]}
                rowKey="key"
                pagination={false}
              />
              <Button type="dashed" onClick={handleAddRow}>Add More Rows</Button>
            </Form.Item>
            <Form.Item name="investigations" label="Investigations">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="dietAdvice" label="Diet Advice">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="exerciseAdvice" label="Exercise Advice">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="specialAdvice" label="Special Advice">
              <TextArea rows={4} />
            </Form.Item>
            <Form.Item name="reviewDate" label="Review Date">
              <DatePicker disabledDate={currentDate => currentDate.isBefore(moment().startOf('day'))} />
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      title: 'Preview',
      icon: <FilePdfOutlined />,
      content: (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: '#fff', wordWrap: 'break-word'  }}>
          <Title level={4}>Personal Details</Title>
          <Table 
            dataSource={[
              { key: 'Name', value: form.getFieldValue('name') },
              { key: 'DOB', value: form.getFieldValue('dob')?.format('DD-MM-YYYY') },
              { key: 'Gender', value: form.getFieldValue('gender') },
              { key: 'Phone No.', value: form.getFieldValue('phone') },
            ]}
            columns={[
              { title: 'Field', dataIndex: 'key', key: 'key' },
              { title: 'Value', dataIndex: 'value', key: 'value' },
            ]}
            pagination={false}
            rowKey="key"
            style={{ marginBottom: '20px' }}
            className="styled-table"
          />
          <Title level={4}>Prescription Details</Title>
          <Table
            dataSource={[
              { key: 'Mode', value: form.getFieldValue('mode') },
              { key: 'Current Complaints', value: form.getFieldValue('currentComplaints') },
              { key: 'Diagnosis', value: form.getFieldValue('diagnosis') },
              { key: 'Treatment', value: (
                <Table
                  dataSource={prescriptionData}
                  columns={[
                    { title: 'Medicine Name', dataIndex: 'medicineName', key: 'medicineName' },
                    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
                    { title: 'Number of Days', dataIndex: 'numberOfDays', key: 'numberOfDays' },
                    { title: 'Special Instructions', dataIndex: 'specialInstructions', key: 'specialInstructions' },
                  ]}
                  pagination={false}
                  rowKey="key"
                  className="styled-table"
                />
              )},
              { key: 'Investigations', value: form.getFieldValue('investigations') },
              { key: 'Diet Advice', value: form.getFieldValue('dietAdvice') },
              { key: 'Exercise Advice', value: form.getFieldValue('exerciseAdvice') },
              { key: 'Special Advice', value: form.getFieldValue('specialAdvice') },
              { key: 'Review Date', value: form.getFieldValue('reviewDate')?.format('DD-MM-YYYY') },
            ]}
            columns={[
              { title: 'Field', dataIndex: 'key', key: 'key' },
              { title: 'Value', dataIndex: 'value', key: 'value' },
            ]}
            pagination={false}
            rowKey="key"
            style={{ marginBottom: '20px' }}
            className="styled-table"
          />
          <Button 
            type="primary" 
            onClick={handleDownloadPDF}
            style={{ display: 'block', margin: '0 auto' }}
          >
            Download PDF
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header className="bg-gradient-to-r from-teal-400 to-teal-600 text-white shadow-md fixed top-0 left-0 right-0 z-50 w-full">
        <div className="flex items-center justify-between max-w-6xl mx-auto px-4">
          <div className="text-xl font-bold">Vanamala Clinic</div>
          <div className="flex items-center space-x-4 ml-auto">
            <Link to="/adminhome">
              <Button className="bg-white text-black border-none hover:bg-teal-100" type="primary">Your Home</Button>
            </Link>
          </div>
        </div>
      </Header>
    
    <div style={{ padding: '10%', marginTop: '10%' }}>
      <Steps current={current} style={{ marginBottom: '20px' }}>
        {steps.map(step => (
          <Step key={step.title} title={step.title} icon={step.icon} />
        ))}
      </Steps>
      <div>{steps[current].content}</div>
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {current > 0 && (
          <Button onClick={handlePrev}>Previous</Button>
        )}
        <div>
            {current < steps.length - 1 ? (
                <Button type="primary" onClick={handleNext}>Next</Button>
            ) : (
            <Button type="primary" onClick={handleNewPatient}>New Patient</Button>
            )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminPage;