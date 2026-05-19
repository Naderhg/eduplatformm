import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentsApi } from '../../api/assignments.api';
import { Loader } from '../../components/common/Loader';
import { toast } from 'react-toastify';
import './Certificate.css';

export const Certificate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [certificateData, setCertificateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await assignmentsApi.getCertificateData(id);
        setCertificateData(response.data);
      } catch (error: any) {
        console.error('Failed to fetch certificate:', error);
        toast.error(error.response?.data?.message || 'Certificate not available');
        navigate(`/student/assignments/${id}/results`);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loader fullScreen text="Loading certificate..." />;
  }

  if (!certificateData) {
    return (
      <div className="certificate-page">
        <div className="no-certificate">
          <h2>Certificate not available</h2>
          <button onClick={() => navigate('/student/assignments')} className="btn btn-primary">Back to Assignments</button>
        </div>
      </div>
    );
  }

  const { studentName, assignmentTitle, courseName, score, maxScore, percentage, teacherName, completedDate, certificateId } = certificateData;

  return (
    <div className="certificate-page">
      <div className="certificate-actions no-print">
        <button onClick={() => navigate(`/student/assignments/${id}/results`)} className="btn btn-ghost">← Back to Results</button>
        <button onClick={handlePrint} className="btn btn-primary">🖨️ Print / Download</button>
      </div>

      <div className="certificate-container">
        <div className="certificate">
          <div className="certificate-border">
            <div className="certificate-inner">
              <div className="certificate-corner top-left"></div>
              <div className="certificate-corner top-right"></div>
              <div className="certificate-corner bottom-left"></div>
              <div className="certificate-corner bottom-right"></div>

              <div className="certificate-header">
                <div className="certificate-logo">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <h4 className="certificate-platform">Education Platform</h4>
              </div>

              <div className="certificate-body">
                <p className="certificate-label">CERTIFICATE OF ACHIEVEMENT</p>
                <div className="certificate-ornament">✦ ✦ ✦</div>
                <p className="certificate-presented">This is to certify that</p>
                <h1 className="certificate-name">{studentName}</h1>
                <p className="certificate-text">has successfully completed</p>
                <h2 className="certificate-assignment">{assignmentTitle}</h2>
                {courseName && <p className="certificate-course">in {courseName}</p>}
                <div className="certificate-score-section">
                  <div className="certificate-score-box">
                    <span className="certificate-score-label">Score Achieved</span>
                    <span className="certificate-score-value">{score}/{maxScore}</span>
                    <span className="certificate-score-percent">{percentage}%</span>
                  </div>
                </div>
              </div>

              <div className="certificate-footer">
                <div className="certificate-date">
                  <div className="certificate-line"></div>
                  <span>{new Date(completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span className="certificate-footer-label">Date of Completion</span>
                </div>
                <div className="certificate-seal">
                  <div className="seal-circle">
                    <span>✓</span>
                  </div>
                </div>
                <div className="certificate-teacher">
                  <div className="certificate-line"></div>
                  <span>{teacherName}</span>
                  <span className="certificate-footer-label">Instructor</span>
                </div>
              </div>

              <div className="certificate-id">Certificate ID: {certificateId}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
