import React, { useState } from 'react';
import { Steps, Form, DatePicker, Table, Typography, Select, Divider, Layout, Button, Input, Space, Checkbox, Row, Col, Modal } from 'antd';
import { UserOutlined, FileTextOutlined, FilePdfOutlined } from '@ant-design/icons';
import './reports.css';
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
  const [currentMedicationData, setCurrentMedicationData] = useState([]);
  const [isOtherChecked, setIsOtherChecked] = useState(false); // State to track if "Other" is checked
  const [otherInputValue, setOtherInputValue] = useState(''); // State to store the "Other" input value
  const [isReportsModalVisible, setIsReportsModalVisible] = useState(false);
  const [reportsData, setReportsData] = useState([]);
  const [pastHistoryData, setPastHistoryData] = useState([]);

  const handlePastHistoryChange = (values) => {
    setPastHistoryData(values.filter(item => item !== 'Other')); // Exclude "Other" initially
  };

  const handleReportsModalOk = () => {
    setIsReportsModalVisible(false);
  };

  const handleReportsModalCancel = () => {
    setIsReportsModalVisible(false);
  };

  const handleReportsChange = (e, key, field) => {
    const newValue = e.target.value;
    const updatedData = reportsData.map(item => {
      if (item.key === key) {
        const updatedItem = { ...item, [field]: newValue };
        
        // Recalculate BMI if height or weight changes
        if (field === 'Ht' || field === 'Wt') {
          updatedItem.BMI = calculateBMI(updatedItem.Ht, updatedItem.Wt);
        }

        return updatedItem;
      }
      return item;
    });

    setReportsData(updatedData);
  };


  const handleAddReportRow = () => {
    const newRow = {
      key: Date.now(),
      Date: '',
      Ht: '',
      Wt: '',
      BMI: '',
      FBS: '',
      PPBS: '',
      A1c: '',
      SCr: '',
      UAC: '',
      TC: '',
      TGL: '',
      LDL: '',
      HDL: '',
      TSH: '',
      Hb: '',
      TLC: '',
      EGFR: '',
      D3: '',
      B12: '',
      AT: '',
      LT4: '',
      MET: '',
      GP: '',
      DPP4: '',
      VOG: '',
      SGLT: '',
      INS: '',
      Remarks: ''
    };
    setReportsData([...reportsData, newRow]);
  };

  const showReportsModal = () => {
    if (reportsData.length === 0) {
      handleAddReportRow(); // Add an empty row if no rows exist
    }
    setIsReportsModalVisible(true);
  };

  const handleDeleteReportRow = (key) => {
    const updatedData = reportsData.filter(item => item.key !== key);
    setReportsData(updatedData);
  };

  const calculateBMI = (heightCm, weightKg) => {
    if (!heightCm || !weightKg) return '';
    // Convert height from cm to meters
    const heightM = heightCm / 100;
    return (weightKg / (heightM * heightM)).toFixed(2);
  };

  const handleCurrentMedicationChange = (e, key, field) => {
    const updatedData = currentMedicationData.map(item =>
      item.key === key ? { ...item, [field]: e.target.value } : item
    );
    setCurrentMedicationData(updatedData);
  };

  const handleAddCurrentMedicationRow = () => {
    const newRow = { key: Date.now(), medicineName: '', frequency: '' };
    setCurrentMedicationData([...currentMedicationData, newRow]);
  };

  const handleDeleteCurrentMedicationRow = (key) => {
    const updatedData = currentMedicationData.filter(item => item.key !== key);
    setCurrentMedicationData(updatedData);
  };

  const handleOtherCheckboxChange = (e) => {
    setIsOtherChecked(e.target.checked);
    if (!e.target.checked) {
      setOtherInputValue(''); // Clear input if "Other" is unchecked
    }
  };

  const handleOtherChange = (e) => {
    setOtherInputValue(e.target.value); // Update state with the new value
  };

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
    const mode = form.getFieldValue('mode') || '';
    const currentComplaints = form.getFieldValue('currentComplaints') || '';
    const pastHistoryData = form.getFieldValue('pastHistory') || [];
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
    const bill = form.getFieldValue('bill') || '';
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
            pdf.text(line, x, y + (index * 6));
        });
        pdf.setFont('helvetica', 'normal'); // Reset font to normal
        return y + (lines.length * 6);
    };

    let y = 60;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    y = addText('Personal Details:', 10, y, pageWidth - 20, true);
    y += 1;

    const fieldWidth = (pageWidth - 20) / 3;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    y = addText(` ${name}`, 10, y, fieldWidth);
    y = addText(` ${dob ? `${age}yrs` : ''} /  ${gender}`, 10, y, fieldWidth * 2);

    y += 5;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    y = addText('Consultation:', 10, y, pageWidth - 20, true);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    y = addText('Mode :', 10, y, pageWidth - 20, true);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    y = addText(mode, fieldWidth - 40, y-6, pageWidth - 20);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    y += 2;
    if (currentComplaints) {
        y = addText('Current Complaints:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        y = addText(currentComplaints, 10, y, pageWidth - 20);
    }

    if (currentMedicationData.length > 0) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      y += 2;
      y = addText('Current Medication:', 10, y, pageWidth - 20, true);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
  
      // Using autoTable to add the table
      pdf.autoTable({
          startY: y,
          head: [['Medicine Name', 'Frequency']],
          body: currentMedicationData.map(item => [
              item.medicineName || '', // Handle undefined values
              item.frequency || ''
          ]),
          margin: { top: 10 },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [22, 160, 133] },
          theme: 'striped', // Optional: You can choose a theme for the table
      });
  
      y = pdf.autoTable.previous.finalY + 6; // Update y position after the table
  }
  
  

  if (pastHistoryData.length > 0 || (isOtherChecked && otherInputValue)) {
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    y += 2;
    y = addText('Past History:', 10, y, pageWidth - 20, true);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');

    // Combine past history items and optionally add otherInputValue
    const pastHistoryItems = pastHistoryData.filter(item => item.trim().toLowerCase() !== 'other');
    if (isOtherChecked && otherInputValue) {
        pastHistoryItems.push(otherInputValue);
    }

    // Join past history items and display
    const pastHistoryText = pastHistoryItems.join(', ');
    y = addText(pastHistoryText, 10, y, pageWidth - 20);
}


    if (diagnosis) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Diagnosis:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        y = addText(diagnosis, 10, y, pageWidth - 20);
    }

    if (treatmentData.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Treatment:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(8);
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
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] },
        });

        y = pdf.autoTable.previous.finalY + 6;
    }

    if (investigations) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Investigations:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        y = addText(investigations, 10, y, pageWidth - 20);
    }

    if (dietAdvice) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Diet Advice:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        y = addText(dietAdvice, 10, y, pageWidth - 20);
    }

    if (exerciseAdvice) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Exercise Advice:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        y = addText(exerciseAdvice, 10, y, pageWidth - 20);
    }

    if (specialAdvice) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Special Advice:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        y = addText(specialAdvice, 10, y, pageWidth - 20);
    }

    if (reviewDate) {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        y += 2;
        y = addText('Review Date:', 10, y, pageWidth - 20, true);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        y = addText(reviewDate, fieldWidth-30, y-6, pageWidth - 20);
        
    }

    if (bill) {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      y += 2;
      y = addText('Consultation Fee:', 10, y, pageWidth - 20, true);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      const formattedBill = `Rs. ${bill} /-`;
      y = addText(formattedBill, fieldWidth-22, y - 6, pageWidth - 20);
      
  }

    // Add footer image
    pdf.addImage(footerImage, 'JPEG', pageWidth - 40, pageHeight - 30, 30, 20);

    const formattedDate = new Date().toISOString().split('T')[0];
    const fileName = `${name.replace(/ /g, '_')}_${formattedDate}.pdf`;
    pdf.save(fileName);
};

const generateRepPDF = (reportsData, form) => {
  // Get patient name and phone number from the form
  const name = form.getFieldValue('name') || '';
  const phone = form.getFieldValue('phone') || '';
  
  // Create a new PDF in landscape mode
  const pdf = new jsPDF('l', 'mm', 'a4');

  // Define columns
  const columns = [
      { title: 'Date', dataKey: 'Date' },
      { title: 'Ht', dataKey: 'Ht' },
      { title: 'Wt', dataKey: 'Wt' },
      { title: 'BMI', dataKey: 'BMI' },
      { title: 'FBS', dataKey: 'FBS' },
      { title: 'PPBS', dataKey: 'PPBS' },
      { title: 'A1c', dataKey: 'A1c' },
      { title: 'SCr', dataKey: 'SCr' },
      { title: 'UAC', dataKey: 'UAC' },
      { title: 'TC', dataKey: 'TC' },
      { title: 'TGL', dataKey: 'TGL' },
      { title: 'LDL', dataKey: 'LDL' },
      { title: 'HDL', dataKey: 'HDL' },
      { title: 'TSH', dataKey: 'TSH' },
      { title: 'Hb', dataKey: 'Hb' },
      { title: 'TLC', dataKey: 'TLC' },
      { title: 'EGFR', dataKey: 'EGFR' },
      { title: 'D3', dataKey: 'D3' },
      { title: 'B12', dataKey: 'B12' },
      { title: 'AT', dataKey: 'AT' },
      { title: 'LT4', dataKey: 'LT4' },
      { title: 'MET', dataKey: 'MET' },
      { title: 'GP', dataKey: 'GP' },
      { title: 'DPP4', dataKey: 'DPP4' },
      { title: 'VOG', dataKey: 'VOG' },
      { title: 'SGLT', dataKey: 'SGLT' },
      { title: 'INS', dataKey: 'INS' },
      { title: 'Remarks', dataKey: 'Remarks' }
  ];

  // Map data for the PDF table
  const rows = reportsData.map((report) => ({
      Date: report.Date || '',
      Ht: report.Ht || '',
      Wt: report.Wt || '',
      BMI: report.BMI || '',
      FBS: report.FBS || '',
      PPBS: report.PPBS || '',
      A1c: report.A1c || '',
      SCr: report.SCr || '',
      UAC: report.UAC || '',
      TC: report.TC || '',
      TGL: report.TGL || '',
      LDL: report.LDL || '',
      HDL: report.HDL || '',
      TSH: report.TSH || '',
      Hb: report.Hb || '',
      TLC: report.TLC || '',
      EGFR: report.EGFR || '',
      D3: report.D3 || '',
      B12: report.B12 || '',
      AT: report.AT || '',
      LT4: report.LT4 || '',
      MET: report.MET || '',
      GP: report.GP || '',
      DPP4: report.DPP4 || '',
      VOG: report.VOG || '',
      SGLT: report.SGLT || '',
      INS: report.INS || '',
      Remarks: report.Remarks || ''
  }));

  // Generate the table in the PDF
  pdf.autoTable({
      head: [columns.map(col => col.title)],
      body: rows.map(row => columns.map(col => row[col.dataKey])),
      margin: { top: 2, left: 3, right: 3 },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        overflow: 'linebreak',
        lineWidth: 0.1, // Border thickness
        lineColor: [0, 0, 0] // Border color (black)
    },
    tableLineColor: [0, 0, 0], // Border color for the table (black)
    tableLineWidth: 0.1, // Border thickness for the table
    theme: 'grid',
  });

  // Save the PDF with the patient name and phone number as the filename
  const fileName = `${name}_${phone}_Reports.pdf`;
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
            <Form.Item name="currentMedication" label="Current Medication">
        <Table
          dataSource={currentMedicationData}
          columns={[
            {
              title: 'Medicine Name',
              dataIndex: 'medicineName',
              key: 'medicineName',
              render: (_, record) => (
                <Input
                  value={record.medicineName}
                  onChange={e => handleCurrentMedicationChange(e, record.key, 'medicineName')}
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
                  onChange={e => handleCurrentMedicationChange(e, record.key, 'frequency')}
                />
              )
            },
            {
              title: 'Actions',
              key: 'actions',
              render: (_, record) => (
                <Space size="middle">
                  <Button onClick={() => handleDeleteCurrentMedicationRow(record.key)}>Delete</Button>
                </Space>
              ),
            },
          ]}
          rowKey="key"
          pagination={false}
        />
        <Button type="dashed" onClick={handleAddCurrentMedicationRow}>Add More Rows</Button>
      </Form.Item>

      <Form.Item name="pastHistory" label="Past History">
        <Checkbox.Group onChange={handlePastHistoryChange}>
          <Row>
            <Col span={8}><Checkbox value="DM">DM</Checkbox></Col>
            <Col span={8}><Checkbox value="HTN">HTN</Checkbox></Col>
            <Col span={8}><Checkbox value="THY">THY</Checkbox></Col>
            <Col span={8}><Checkbox value="DL">DL</Checkbox></Col>
            <Col span={8}><Checkbox value="IHD">IHD</Checkbox></Col>
            <Col span={8}><Checkbox value="CA">CA</Checkbox></Col>
            <Col span={8}><Checkbox value="BA">BA</Checkbox></Col>
            <Col span={8}><Checkbox value="TB">TB</Checkbox></Col>
            <Col span={8}>
              <Checkbox value="Other" onChange={handleOtherCheckboxChange}>Other</Checkbox>
              {isOtherChecked && (
                <Input 
                  style={{ width: '100%', marginTop: '8px' }} 
                  placeholder="Please specify" 
                  value={otherInputValue} 
                  onChange={handleOtherChange} 
                />
              )}
            </Col>
          </Row>
        </Checkbox.Group>
      </Form.Item>
      <Form.Item>
      <Button type="primary" onClick={showReportsModal} style={{ backgroundColor: '#38B2AC', borderColor: '#38B2AC' }}>
        Add/View Reports
      </Button>

      <Modal
        title="Reports"
        visible={isReportsModalVisible}
        onOk={handleReportsModalOk}
        onCancel={handleReportsModalCancel}
        width={1000}
      >
        <Table
          dataSource={reportsData}
          columns={[
            { title: 'Date', dataIndex: 'Date', key: 'Date', render: (_, record) => (
              <Input value={record.Date} onChange={e => handleReportsChange(e, record.key, 'Date')} />
            )},
            { title: 'Ht', dataIndex: 'Ht', key: 'Ht', render: (_, record) => (
              <Input value={record.Ht} onChange={e => handleReportsChange(e, record.key, 'Ht')} />
            )},
            { title: 'Wt', dataIndex: 'Wt', key: 'Wt', render: (_, record) => (
              <Input value={record.Wt} onChange={e => handleReportsChange(e, record.key, 'Wt')} />
            )},
            { title: 'BMI', dataIndex: 'BMI', key: 'BMI', render: (_, record) => (
              <Input value={record.BMI} readOnly />
            )},
            { title: 'FBS', dataIndex: 'FBS', key: 'FBS', render: (_, record) => (
              <Input value={record.FBS} onChange={e => handleReportsChange(e, record.key, 'FBS')} />
            )},
            { title: 'PPBS', dataIndex: 'PPBS', key: 'PPBS', render: (_, record) => (
              <Input value={record.PPBS} onChange={e => handleReportsChange(e, record.key, 'PPBS')} />
            )},
            { title: 'A1c', dataIndex: 'A1c', key: 'A1c', render: (_, record) => (
              <Input value={record.A1c} onChange={e => handleReportsChange(e, record.key, 'A1c')} />
            )},
            { title: 'SCr', dataIndex: 'SCr', key: 'SCr', render: (_, record) => (
              <Input value={record.SCr} onChange={e => handleReportsChange(e, record.key, 'SCr')} />
            )},
            { title: 'UAC', dataIndex: 'UAC', key: 'UAC', render: (_, record) => (
              <Input value={record.UAC} onChange={e => handleReportsChange(e, record.key, 'UAC')} />
            )},
            { title: 'TC', dataIndex: 'TC', key: 'TC', render: (_, record) => (
              <Input value={record.TC} onChange={e => handleReportsChange(e, record.key, 'TC')} />
            )},
            { title: 'TGL', dataIndex: 'TGL', key: 'TGL', render: (_, record) => (
              <Input value={record.TGL} onChange={e => handleReportsChange(e, record.key, 'TGL')} />
            )},
            { title: 'LDL', dataIndex: 'LDL', key: 'LDL', render: (_, record) => (
              <Input value={record.LDL} onChange={e => handleReportsChange(e, record.key, 'LDL')} />
            )},
            { title: 'HDL', dataIndex: 'HDL', key: 'HDL', render: (_, record) => (
              <Input value={record.HDL} onChange={e => handleReportsChange(e, record.key, 'HDL')} />
            )},
            { title: 'TSH', dataIndex: 'TSH', key: 'TSH', render: (_, record) => (
              <Input value={record.TSH} onChange={e => handleReportsChange(e, record.key, 'TSH')} />
            )},
            { title: 'Hb', dataIndex: 'Hb', key: 'Hb', render: (_, record) => (
              <Input value={record.Hb} onChange={e => handleReportsChange(e, record.key, 'Hb')} />
            )},
            { title: 'TLC', dataIndex: 'TLC', key: 'TLC', render: (_, record) => (
              <Input value={record.TLC} onChange={e => handleReportsChange(e, record.key, 'TLC')} />
            )},
            { title: 'EGFR', dataIndex: 'EGFR', key: 'EGFR', render: (_, record) => (
              <Input value={record.EGFR} onChange={e => handleReportsChange(e, record.key, 'EGFR')} />
            )},
            { title: 'D3', dataIndex: 'D3', key: 'D3', render: (_, record) => (
              <Input value={record.D3} onChange={e => handleReportsChange(e, record.key, 'D3')} />
            )},
            { title: 'B12', dataIndex: 'B12', key: 'B12', render: (_, record) => (
              <Input value={record.B12} onChange={e => handleReportsChange(e, record.key, 'B12')} />
            )},
            { title: 'AT', dataIndex: 'AT', key: 'AT', render: (_, record) => (
              <Input value={record.AT} onChange={e => handleReportsChange(e, record.key, 'AT')} />
            )},
            { title: 'LT4', dataIndex: 'LT4', key: 'LT4', render: (_, record) => (
              <Input value={record.LT4} onChange={e => handleReportsChange(e, record.key, 'LT4')} />
            )},
            { title: 'MET', dataIndex: 'MET', key: 'MET', render: (_, record) => (
              <Input value={record.MET} onChange={e => handleReportsChange(e, record.key, 'MET')} />
            )},
            { title: 'GP', dataIndex: 'GP', key: 'GP', render: (_, record) => (
              <Input value={record.GP} onChange={e => handleReportsChange(e, record.key, 'GP')} />
            )},
            { title: 'DPP4', dataIndex: 'DPP4', key: 'DPP4', render: (_, record) => (
              <Input value={record.DPP4} onChange={e => handleReportsChange(e, record.key, 'DPP4')} />
            )},
            { title: 'VOG', dataIndex: 'VOG', key: 'VOG', render: (_, record) => (
              <Input value={record.VOG} onChange={e => handleReportsChange(e, record.key, 'VOG')} />
            )},
            { title: 'SGLT', dataIndex: 'SGLT', key: 'SGLT', render: (_, record) => (
              <Input value={record.SGLT} onChange={e => handleReportsChange(e, record.key, 'SGLT')} />
            )},
            { title: 'INS', dataIndex: 'INS', key: 'INS', render: (_, record) => (
              <Input value={record.INS} onChange={e => handleReportsChange(e, record.key, 'INS')} />
            )},
            { title: 'Remarks', dataIndex: 'Remarks', key: 'Remarks', render: (_, record) => (
              <Input value={record.Remarks} onChange={e => handleReportsChange(e, record.key, 'Remarks')} />
            )},
            {
              title: 'Action',
              key: 'action',
              render: (_, record) => (
                <Button type="danger" onClick={() => handleDeleteReportRow(record.key)}>
                  Delete
                </Button>
              ),
            },
          ]}
          scroll={{ y: 300, x: 'max-content' }}
        />

        <Button type="primary" onClick={handleAddReportRow} style={{ backgroundColor: '#38B2AC', borderColor: '#38B2AC' }}>
          Add Report
        </Button>
      </Modal>
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
            <Form.Item name="bill" label="Consultation Fee">
              <Input type="number" min={1} />
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
              { key: 'Current Medication', value: (
                <Table
                  dataSource={currentMedicationData}
                  columns={[
                    { title: 'Medicine Name', dataIndex: 'medicineName', key: 'medicineName' },
                    { title: 'Frequency', dataIndex: 'frequency', key: 'frequency' },
                  ]}
                  pagination={false}
                  rowKey="key"
                  style={{ marginBottom: '20px' }}
                />
              )},
              { key: 'Past History', value: (
                <div>
                  {pastHistoryData.length ? (
                    <ul>
                      {pastHistoryData.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                      {isOtherChecked && otherInputValue && (
                        <li>{otherInputValue}</li>
                      )}
                    </ul>
                  ) : (
                    'No past history selected'
                  )}
                </div>
              )},
              { key: 'Reports', value: (
                <Button type="primary" onClick={showReportsModal} style={{ backgroundColor: '#38B2AC', borderColor: '#38B2AC' }}>
                  View Reports
                </Button>
              )},
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
              { key: 'Consultation Fee', value: `₹ ${form.getFieldValue('bill')}` },
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <Button 
              type="primary" 
              onClick={handleDownloadPDF}
              style={{ backgroundColor: '#38B2AC', borderColor: '#38B2AC' }}
            >
              Download Prescription
            </Button>
            <Button
              type="primary"
              onClick={() => generateRepPDF(reportsData, form)} 
              style={{ backgroundColor: '#38B2AC', borderColor: '#38B2AC' }}
            >
              Download Report 
            </Button>
          </div>

          <Modal
        title="Reports"
        visible={isReportsModalVisible}
        onOk={handleReportsModalOk}
        onCancel={handleReportsModalCancel}
        width={1000}
      >
        <Table 
          dataSource={reportsData}
          columns={[
            { title: 'Date', dataIndex: 'Date', key: 'Date', width: 100 },
            { title: 'Ht', dataIndex: 'Ht', key: 'Ht', width: 100 },
            { title: 'Wt', dataIndex: 'Wt', key: 'Wt', width: 100 },
            { title: 'BMI', dataIndex: 'BMI', key: 'BMI', width: 100 },
            { title: 'FBS', dataIndex: 'FBS', key: 'FBS', width: 100 },
            { title: 'PPBS', dataIndex: 'PPBS', key: 'PPBS', width: 100 },
            { title: 'A1c', dataIndex: 'A1c', key: 'A1c', width: 100 },
            { title: 'SCr', dataIndex: 'SCr', key: 'SCr', width: 100 },
            { title: 'UAC', dataIndex: 'UAC', key: 'UAC', width: 100 },
            { title: 'TC', dataIndex: 'TC', key: 'TC', width: 100 },
            { title: 'TGL', dataIndex: 'TGL', key: 'TGL', width: 100 },
            { title: 'LDL', dataIndex: 'LDL', key: 'LDL', width: 100 },
            { title: 'HDL', dataIndex: 'HDL', key: 'HDL', width: 100 },
            { title: 'TSH', dataIndex: 'TSH', key: 'TSH', width: 100 },
            { title: 'Hb', dataIndex: 'Hb', key: 'Hb', width: 100 },
            { title: 'TLC', dataIndex: 'TLC', key: 'TLC', width: 100 },
            { title: 'EGFR', dataIndex: 'EGFR', key: 'EGFR', width: 100 },
            { title: 'D3', dataIndex: 'D3', key: 'D3', width: 100 },
            { title: 'B12', dataIndex: 'B12', key: 'B12', width: 100 },
            { title: 'AT', dataIndex: 'AT', key: 'AT', width: 100 },
            { title: 'LT4', dataIndex: 'LT4', key: 'LT4', width: 100 },
            { title: 'MET', dataIndex: 'MET', key: 'MET', width: 100 },
            { title: 'GP', dataIndex: 'GP', key: 'GP', width: 100 },
            { title: 'DPP4', dataIndex: 'DPP4', key: 'DPP4', width: 100 },
            { title: 'VOG', dataIndex: 'VOG', key: 'VOG', width: 100 },
            { title: 'SGLT', dataIndex: 'SGLT', key: 'SGLT', width: 100 },
            { title: 'INS', dataIndex: 'INS', key: 'INS', width: 100 },
            { title: 'Remarks', dataIndex: 'Remarks', key: 'Remarks', width: 100 },
          ]}
          pagination={false}
          scroll={{ y: 300, x: 'max-content' }}
          rowKey="Date"
          className="reports-table"
          
          
        />
      </Modal>
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
              <Button className="bg-white text-black border-none hover:bg-teal-100" type="primary" >Your Home</Button>
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
          <Button onClick={handlePrev} style={{ backgroundColor: '#38B2AC', borderColor: '#38B2AC' }}>Previous</Button>
        )}
        <div>
            {current < steps.length - 1 ? (
                <Button type="primary" onClick={handleNext} style={{ backgroundColor: '#38B2AC', borderColor: '#38B2AC' }}>Next</Button>
            ) : (
            <Button type="primary" onClick={handleNewPatient} style={{ backgroundColor: '#38B2AC', borderColor: '#38B2AC' }}>New Patient</Button>
            )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default AdminPage;