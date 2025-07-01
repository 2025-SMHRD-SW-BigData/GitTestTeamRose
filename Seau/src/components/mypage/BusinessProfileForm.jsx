import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Edit, Save, X, Camera } from 'lucide-react'; // Camera 아이콘 추가
import '../../style/mypage.css';

// AWS SDK import 추가 (설치 필요: npm install @aws-sdk/client-s3)
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// --- AWS S3 설정 (!!!본인의 AWS S3 설정으로 채워주세요!!!) ---
// 경고: 클라이언트 측 코드에 AWS 접근 키를 직접 포함하는 것은 보안상 매우 위험합니다.
// 실제 서비스에서는 반드시 백엔드 서버를 통해 임시 자격 증명을 발급받거나,
// Presigned URL을 생성하여 사용하는 방식을 강력히 권장합니다.
const awsConfig = {
  region: "ap-southeast-2", // 예: 서울 리전 (본인의 S3 버킷 리전으로 변경)
  bucketName: "seaucloud", // 실제 S3 버킷 이름으로 변경
  accessKeyId: "AKIASKD5PB3ZPAOAVFRY", // 본인의 AWS Access Key ID
  secretAccessKey: "lopehabaEv0sFTCPDcGyiI/s9fazZWRhN0euyl9x", // 본인의 AWS Secret Access Key
};

// AWS S3 클라이언트 초기화
const s3Client = new S3Client({
  region: awsConfig.region,
  credentials: {
    accessKeyId: awsConfig.accessKeyId,
    secretAccessKey: awsConfig.secretAccessKey,
  },
});
// --- AWS S3 설정 끝 ---

// 메인 React 컴포넌트
const BusinessProfileForm = ({ userId }) => {
  // 폼 입력 필드를 위한 상태 변수
  const [formData, setFormData] = useState({
    placeName: '',
    description: '',
    address: '',
    mainImageUrl: '', // 이미지 URL이 저장됩니다.
    placeType: '',
    operationHours: '',
    phoneNumber: '',
    busy: '',
  });

  const [hasBusiness, setHasBusiness] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(''); // 사용자에게 메시지를 보여주기 위한 상태
  const [messageType, setMessageType] = useState('info');

  const fileInputRef = useRef(null); // 파일 입력을 위한 ref
  const [selectedFile, setSelectedFile] = useState(null); // 사용자가 선택한 파일 객체를 저장

  // 🔄 사업체 정보 불러오기
  useEffect(() => {
    const fetchBusinessInfo = async () => {
      try {
        const response = await axios.post('http://localhost:3001/place/get', { userId });

        if (response.data && response.data.place) {
          const place = response.data.place;
          setFormData({
            placeName: place.place_name || '',
            description: place.description || '',
            address: place.address || '',
            mainImageUrl: place.main_image_url || '',
            placeType: place.place_type || '',
            operationHours: place.operating_time || '',
            phoneNumber: place.phone_number || '',
            busy: place.busy || '',
          });
          setHasBusiness(true);
        } else {
          setHasBusiness(false);
          // 사업체 정보가 없을 때 mainImageUrl을 기본값으로 초기화 (선택 사항)
          setFormData(prev => ({ ...prev, mainImageUrl: '' }));
        }
      } catch (err) {
        console.error('사업체 정보 불러오기 실패:', err);
        setHasBusiness(false);
        setMessage('사업체 정보를 불러오는 데 실패했습니다.', 'error');
      }
    };

    if (userId) fetchBusinessInfo();
  }, [userId]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file); // 선택된 파일 객체 저장
      const reader = new FileReader();
      reader.onload = (e) => {
        // 미리보기용 URL 설정
        setFormData((prev) => ({ ...prev, mainImageUrl: e.target?.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage('서버로 전송 중...');
  setMessageType('info');

  let finalImageUrl = formData.mainImageUrl; // 기본은 현재 미리보기 URL 또는 기존 S3 URL

  try {
    // 1. 새로운 파일이 선택되었다면 AWS S3에 업로드
    if (selectedFile) {
      console.log('메인 이미지 업로드 중 (AWS S3 직접 업로드)...');
      const fileExtension = selectedFile.name.split('.').pop();
      // S3 키 생성 (userId와 placeName 사용)
      const s3Key = `place_images/${formData.placeName || 'default'}_${Date.now()}.${fileExtension}`;

      const arrayBuffer = await selectedFile.arrayBuffer();
      const bodyData = new Uint8Array(arrayBuffer);

      const command = new PutObjectCommand({
        Bucket: awsConfig.bucketName,
        Key: s3Key,
        Body: bodyData,
        ContentType: selectedFile.type,
        ACL: 'public-read', // 공개 읽기 권한 설정
      });

      await s3Client.send(command);
      // ★★★ 여기가 중요합니다: S3에서 반환되는 퍼블릭 URL을 구성합니다.
      finalImageUrl = `https://${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com/${s3Key}`;
      console.log('AWS S3 직접 업로드 완료. URL:', finalImageUrl);
    }

    // 2. 백엔드로 전송할 데이터 구성
    const dataToSend = {
      userId,
      placeName: formData.placeName,
      description: formData.description,
      address: formData.address,
      mainImageUrl: finalImageUrl, // ★★★ 여기에 S3 퍼블릭 URL이 들어갑니다.
      placeType: formData.placeType,
      operationHours: formData.operationHours,
      phone_number: formData.phoneNumber,
      busy: formData.busy,
    };

    console.log('백엔드로 전송할 데이터:', dataToSend);
     
      console.log('백엔드로 전송할 데이터:', dataToSend);

      // 3. 백엔드와 통신
      const url = hasBusiness
        ? 'http://localhost:3001/place/update'
        : 'http://localhost:3001/place/add';

      const response = await axios.post(url, dataToSend);

      if (response.data.success) {
        setMessage(`성공: ${response.data.message}`);
        setMessageType('success');
        setHasBusiness(true);
        setIsEditing(false);
        setSelectedFile(null); // 업로드 완료 후 선택된 파일 초기화
        // UI의 mainImageUrl을 실제 저장된 URL로 업데이트
        setFormData(prev => ({ ...prev, mainImageUrl: finalImageUrl }));
      } else {
        setMessage(`실패: ${response.data.message || '알 수 없는 오류'}`);
        setMessageType('error');
      }
    } catch (error) {
      console.error('전송 오류:', error);
      setMessage('서버 오류가 발생했습니다. 다시 시도해주세요.', 'error');
      // 오류 발생 시, 원본 이미지 URL로 되돌리거나 사용자에게 알려주는 추가 처리
      setFormData(prev => ({ ...prev, mainImageUrl: formData.mainImageUrl }));
      setSelectedFile(null);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage(''); // 메시지 초기화
    setSelectedFile(null); // 수정 모드 진입 시 이전에 선택된 파일 초기화
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage(''); // 메시지 초기화
    setSelectedFile(null); // 선택된 파일 초기화
    // 취소 시 원본 데이터로 되돌리는 로직이 필요하다면 추가 (현재는 useEffect에서 불러오는 데이터가 원본)
    // 그러나 UI 상에서만 변경된 데이터는 되돌려야 할 수 있음. 간단하게 새로고침하거나,
    // 취소 시 원본 데이터를 다시 불러오는 로직을 추가하는 것이 더 견고합니다.
    // 여기서는 fetchBusinessInfo를 다시 호출하여 최신 DB 데이터를 불러오는 방식으로 구현할 수 있습니다.
    const fetchBusinessInfoOnCancel = async () => {
      try {
        const response = await axios.post('http://localhost:3001/place/get', { userId });
        if (response.data && response.data.place) {
          const place = response.data.place;
          setFormData({
            placeName: place.place_name || '',
            description: place.description || '',
            address: place.address || '',
            mainImageUrl: place.main_image_url || '',
            placeType: place.place_type || '',
            operationHours: place.operating_time || '',
            phoneNumber: place.phone_number || '',
            busy: place.busy || '',
          });
        }
      } catch (err) {
        console.error('사업체 정보 불러오기 실패 (취소 시):', err);
      }
    };
    if (hasBusiness) fetchBusinessInfoOnCancel();
    else { // 사업체가 없었는데 '추가' 모드에서 취소한 경우 폼 초기화
        setFormData({
            placeName: '', description: '', address: '', mainImageUrl: '',
            placeType: '', operationHours: '', phoneNumber: '', busy: '',
        });
    }
  };

  // 🔽 사업체가 없을 때 등록 버튼만 보임
  if (!hasBusiness && !isEditing) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">사업체 등록</h2>
        </div>
        <div className="card-content">
          <button className="button primary" onClick={() => setIsEditing(true)}>
            사업체 등록하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">사업체 정보</h2>
        {!isEditing ? (
          <button className="button primary" onClick={handleEdit}>
            <Edit size={16} />
            <span>수정</span>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="button success" onClick={handleSubmit}>
              <Save size={16} />
              <span>저장</span>
            </button>
            <button className="button outline" onClick={handleCancel}>
              <X size={16} />
              <span>취소</span>
            </button>
          </div>
        )}
      </div>

      {message && <div className={`message ${messageType}`}>{message}</div>}

      <div className="card-content">
        <form onSubmit={handleSubmit}>
          {/* 메인 이미지 미리보기 및 업로드 필드 */}
          <div className="form-group avatar-container">
            <div className="avatar-wrapper">
              <div className="avatar" style={{ width: '120px', height: '120px', marginBottom: '10px' }}>
                {formData.mainImageUrl ? (
                  <img src={formData.mainImageUrl} alt="Main" className="avatar-image" />
                ) : (
                  <div className="avatar-fallback" style={{ fontSize: '40px' }}>
                    <Camera size={40} color="#6b7280" />
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <button type="button" className="camera-button" onClick={handleCameraClick}>
                    <Camera size={20} />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                    accept="image/*"
                  />
                </>
              )}
            </div>
            {isEditing && <p className="help-text">메인 사진을 변경하려면 카메라 아이콘을 클릭하세요</p>}
          </div>

          {[
            { label: '장소 이름', field: 'placeName', type: 'text' },
            { label: '주소', field: 'address', type: 'text' },
            // mainImageUrl 필드는 이제 파일 업로드로 대체되므로 목록에서 제거
            { label: '장소 타입', field: 'placeType', type: 'text' },
            { label: '운영 시간', field: 'operationHours', type: 'text' },
            { label: '연락처', field: 'phoneNumber', type: 'tel' },
            { label: '설명', field: 'description', type: 'textarea' },
            { label: '혼잡도', field: 'busy', type: 'select' },
          ].map(({ label, field, type }) => (
            <div className="form-group" key={field}>
              <label className="label">{label}</label>
              {type === 'textarea' ? (
                <textarea
                  className="textarea"
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  disabled={!isEditing}
                  rows="3"
                  style={{ marginBottom: '15px' }}
                />
              ) : type === 'select' ? (
                <select
                  className="input"
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  disabled={!isEditing}
                  style={{ marginBottom: '15px' }}
                >
                  <option value="원활">원활</option>
                  <option value="혼잡">혼잡</option>
                  <option value="이용불가">이용불가</option>
                </select>
              ) : (
                <input
                  className="input"
                  type={type}
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  disabled={!isEditing}
                  required={field === 'placeName' || field === 'address'}
                  style={{ marginBottom: '15px' }}
                />
              )}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
};

export default BusinessProfileForm;