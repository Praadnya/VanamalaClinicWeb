# Vanamala Clinic Website

This is a clinic management website built for **Dr. Vanamala**, providing an efficient platform for managing patient appointments, generating PDFs for prescriptions, and displaying important clinic information. The website includes a home page showcasing the clinic's services, timings, and announcements.

## Key Features

- **Dynamic Home Page**: Showcases clinic details like services, timings, announcements, and reference links.
- **Admin Panel**: Secure login for clinic administrators to manage patient appointments and announcements.
- **PDF Generation**: Generate patient prescriptions in PDF format using jsPDF.
- **Appointment Notifications**: Twilio integration to send appointment notifications via SMS.
- **Responsive Design**: Built with Tailwind CSS to ensure the website is fully responsive across devices.

## Tech Stack

- **Frontend**: 
  - ReactJS (state and context management)
  - Tailwind CSS (responsive styling)
  - Ant Design (UI components)
  - Axios (API communication)
  
- **Backend**:
  - FastAPI (backend server)
  - MongoDB (data storage)

- **Other Tools**:
  - jsPDF (PDF generation for patient prescriptions)
  - Twilio (doctor authentication via SMS)

## Commands to run the project

### Clone the repository:
   ```bash
   git clone https://github.com/Praadnya/VanamalaClinicWeb.git
   cd VanamalaClinicWeb
   ```
### Backend
To start the FastAPI server, run:
```bash
cd server
uvicorn app.main:app --reload
```
### Frontend
To start the React app, run:
```bash
cd client
npm start
```

