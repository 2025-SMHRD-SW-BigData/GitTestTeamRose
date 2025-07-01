import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import styled from '@emotion/styled';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Save, X, Trash2, Camera } from 'lucide-react';
import { UserContext } from '../../context/UserContext';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// --- AWS S3 설정 (!!!여기를 본인의 AWS S3 설정으로 채워주세요!!!) ---
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

// --- 스타일 컴포넌트 ---
const PageContainer = styled.div`
    padding: 2rem;
    background-color: #f9fafb;
    min-height: 100vh;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 1rem;
`;

const Title = styled.h1`
    font-size: 2.25rem;
    font-weight: 700;
    color: #111827;
`;

const Button = styled.button`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;

    ${props => props.variant === 'primary' && `
        background-color: #7c3aed;
        color: white;
        &:hover {
            background-color: #6d28d9;
        }
    `}

    ${props => props.variant === 'outline' && `
        background-color: transparent;
        color: #374151;
        border: 1px solid #d1d5db;
        &:hover {
            background-color: #f9fafb;
        }
    `}
    
    ${props => props.variant === 'danger' && `
        background-color: #dc2626;
        color: white;
        &:hover {
            background-color: #b91c1c;
        }
    `}
`;

const ScheduleGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
`;

const ScheduleCard = styled.div`
    background-color: white;
    border-radius: 0.75rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s;
    &:hover {
        transform: translateY(-5px);
    }
`;

const CardImage = styled.img`
    width: 100%;
    height: 180px; /* 고정 높이 */
    object-fit: cover;
    background-color: #f3f4f6; /* 이미지 로딩 전/없을 때 배경 */
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6b7280;
    font-size: 1rem;
`;

const CardContent = styled.div`
    padding: 1.5rem;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
`;

const CardTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 0.5rem;
    word-break: break-word;
`;

const CardDescription = styled.p`
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-grow: 1;
`;

const CardDetail = styled.p`
    font-size: 0.875rem;
    color: #4b5563;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const CardActions = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 1rem;
`;

const ActionButton = styled.button`
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: background-color 0.2s;

    ${props => props.type === 'edit' && `
        background-color: #60a5fa;
        color: white;
        &:hover { background-color: #3b82f6; }
    `}
    ${props => props.type === 'delete' && `
        background-color: #ef4444;
        color: white;
        &:hover { background-color: #dc2626; }
    `}
    ${props => props.type === 'members' && `
        background-color: #a78bfa;
        color: white;
        &:hover { background-color: #8b5cf6; }
    `}
    ${props => props.type === 'accept' && `
        background-color: #10b981;
        color: white;
        &:hover { background-color: #059669; }
    `}
    ${props => props.type === 'reject' && `
        background-color: #f59e0b;
        color: white;
        &:hover { background-color: #d97706; }
    `}
    ${props => props.type === 'close' && `
        background-color: #6b7280;
        color: white;
        &:hover { background-color: #4b5563; }
    `}
`;

const EmptyState = styled.div`
    text-align: center;
    padding: 3rem;
    color: #6b7280;
    font-size: 1.125rem;
`;

// --- 모달 관련 스타일 ---
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalOverlayProfile = styled(ModalOverlay)`
    z-index: 1001; /* 프로필 모달은 멤버 모달 위에 오도록 */
`;

const ModalContent = styled.div`
    background: white;
    padding: 2rem;
    border-radius: 1rem;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
`;

const ModalHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
`;

const ModalTitle = styled.h2`
    font-size: 1.75rem;
    font-weight: 700;
    color: #111827;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    &:hover {
        color: #111827;
    }
`;

const FormGroup = styled.div`
    margin-bottom: 1rem;
`;

const Label = styled.label`
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
    margin-bottom: 0.5rem;
`;

const Input = styled.input`
    width: 94%; /* 부모 요소에 맞게 조정 */
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    &:focus {
        outline: none;
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
`;

const Textarea = styled.textarea`
    width: 94%; /* 부모 요소에 맞게 조정 */
    padding: 12px;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    min-height: 80px;
    resize: vertical;
    &:focus {
        outline: none;
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
`;

const Select = styled.select`
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    background-color: white;
    cursor: pointer;
    &:focus {
        outline: none;
        border-color: #7c3aed;
        box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
`;

const MessageBar = styled.div`
    padding: 12px 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    font-weight: 500;
    text-align: center;
    ${props => props.type === 'success' && `
        background-color: #d1fae5;
        color: #065f46;
    `}
    ${props => props.type === 'error' && `
        background-color: #fee2e2;
        color: #991b1b;
    `}
`;

const ScheduleMembersSection = styled.div`
    margin-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
`;

const SectionTitle = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    color: #111827;
    margin-bottom: 1rem;
`;

const MemberList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const MemberItem = styled.li`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    &:hover {
        background-color: #f3f4f6;
    }
`;

const MemberInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75rem;
`;

const MemberName = styled.span`
    font-weight: 500;
    color: #374151;
`;

const MemberStatus = styled.span`
    font-size: 0.875rem;
    font-weight: 600;
    padding: 0.25rem 0.75rem;
    border-radius: 0.5rem;

    ${props => props.status === 0 && ` /* 대기중 */
        background-color: #fef3c7;
        color: #d97706;
    `}
    ${props => props.status === 1 && ` /* 수락됨 */
        background-color: #d1fae5;
        color: #065f46;
    `}
    ${props => props.status === 2 && ` /* 거절됨 */
        background-color: #fee2e2;
        color: #991b1b;
    `}
`;

const ProfileActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    padding-top: 1.5rem;
`;

const ProfileImageContainer = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
`;

const ProfileImage = styled.img`
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e5e7eb;
`;

const ProfileDetail = styled.p`
    font-size: 1rem;
    color: #4b5563;
    margin-bottom: 0.5rem;
`;

// 이미지 업로드 관련 스타일 추가
const AvatarContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    margin-bottom: 24px;
`;

const AvatarWrapper = styled.div`
    position: relative;
`;

const Avatar = styled.div`
    width: 96px;
    height: 96px;
    border-radius: 50%;
    overflow: hidden;
    background-color: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const AvatarImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: cover;
`;

const AvatarFallback = styled.div`
    font-size: 32px;
    font-weight: bold;
    color: #6b7280;
`;

const CameraButton = styled.button`
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: #7c3aed;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #6d28d9;
    }
`;

const HiddenInput = styled.input`
    display: none;
`;

const HelpText = styled.p`
    font-size: 14px;
    color: #6b7280;
    text-align: center;
`;
// --- 스타일 컴포넌트 끝 ---

// --- ScheduleManagement 컴포넌트 시작 ---
export function ScheduleManagement() {
    const { userId } = useContext(UserContext); // 현재 로그인한 사용자 ID
    const navigate = useNavigate();
    const {userData, placeData} = useContext(UserContext);
    const [schedules, setSchedules] = useState([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const [newSchedule, setNewSchedule] = useState({
        title: '',
        description: '',
        location_name: '',
        address: '',
        scheduled_date: '',
        max_participants: '',
        cost_per_person: '',
        schedule_image_url: '', // 이미지 URL 필드 추가
    });

    const [editingSchedule, setEditingSchedule] = useState(null);
    const [selectedScheduleForMembers, setSelectedScheduleForMembers] = useState(null);
    const [scheduleMembers, setScheduleMembers] = useState({});
    const [selectedMemberProfile, setSelectedMemberProfile] = useState(null);
    const [currentMemberStatusForModal, setCurrentMemberStatusForModal] = useState(null);

    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const [selectedScheduleImageFile, setSelectedScheduleImageFile] = useState(null);
    const imageInputRef = useRef(null);

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        // setTimeout(() => {
        //   setMessage('');
        //   setMessageType('');
        // }, 5000);
    };

    // 스케줄 목록 불러오기
    const fetchSchedules = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await axios.post('http://localhost:3001/schedules', { userId });
            if (res.data.success) {
                setSchedules(res.data.data);
            } else {
                showMessage(`스케줄 로드 실패: ${res.data.message}`, 'error');
            }
        } catch (error) {
            console.error('스케줄 로드 중 오류 발생:', error);
            showMessage('스케줄 정보를 불러오는 데 실패했습니다.', 'error');
        }
    }, [userId]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // --- 모달 열고 닫는 함수들 ---
    const handleOpenCreateModal = () => {
        setNewSchedule({
            title: '', description: '', location_name: '', address: '',
            scheduled_date: '', max_participants: '', cost_per_person: '',
            schedule_image_url: '',
        });
        // user_type이 1이고 placeData가 있을 때 자동 채우기
        if (userData && userData.user_type === 1 && placeData) {
            setNewSchedule({
            title: '', description: '', location_name: placeData.place_name, address: placeData.address,
            scheduled_date: '', max_participants: '', cost_per_person: '',
            schedule_image_url: '',
        });
        } else {
            // user_type이 1이 아니거나 placeData가 없으면 빈 값으로 초기화
            setNewSchedule({
            title: '', description: '', location_name: '', address: '',
            scheduled_date: '', max_participants: '', cost_per_person: '',
            schedule_image_url: '', });
        }
        setSelectedScheduleImageFile(null); // 파일 선택 초기화
        setIsCreateModalOpen(true);
        setMessage('');
    };

    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
    };

    const handleOpenEditModal = (schedule) => {
        setEditingSchedule({
            ...schedule,
            scheduled_date: schedule.scheduled_date ? schedule.scheduled_date.substring(0, 10) : '',
        });
        setSelectedScheduleImageFile(null); // 파일 선택 초기화
        setIsEditModalOpen(true);
        setMessage('');
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingSchedule(null);
    };

    const handleOpenMembersModal = (schedule) => {
        setSelectedScheduleForMembers(schedule);
        if (!scheduleMembers[schedule.schedule_id]) {
            fetchScheduleMembers(schedule.schedule_id);
        }
        setIsMembersModalOpen(true);
        setMessage('');
    };

    const handleCloseMembersModal = () => {
        setIsMembersModalOpen(false);
        setSelectedScheduleForMembers(null);
    };

    const handleCloseProfileModal = () => {
        setIsProfileModalOpen(false);
        setSelectedMemberProfile(null);
        setCurrentMemberStatusForModal(null);
    };

    // --- 입력 값 변경 핸들러 ---
    const handleNewScheduleChange = (e) => {
        const { name, value } = e.target;
        setNewSchedule(prev => ({ ...prev, [name]: value }));
    };

    const handleEditingScheduleChange = (e) => {
        const { name, value } = e.target;
        setEditingSchedule(prev => ({ ...prev, [name]: value }));
    };

    // --- 이미지 파일 선택 핸들러 ---
    const handleImageSelect = (event, isForNewSchedule) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedScheduleImageFile(file); // 선택된 파일 객체 저장
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (isForNewSchedule) {
                    setNewSchedule(prev => ({ ...prev, schedule_image_url: result })); // 미리보기용 URL 설정
                } else {
                    setEditingSchedule(prev => ({ ...prev, schedule_image_url: result })); // 미리보기용 URL 설정
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageClick = (isForNewSchedule) => {
        // fileInputRef는 하나만 사용되므로, true/false로 구분할 필요 없이 항상 imageInputRef를 사용
        imageInputRef.current?.click();
    };


    // --- 새로운 스케줄 생성 ---
    const createSchedule = async () => {
        if (!userId) {
            showMessage('로그인 후 스케줄을 생성할 수 있습니다.', 'error');
            return;
        }

        if (!newSchedule.title || !newSchedule.address || !newSchedule.scheduled_date || !newSchedule.max_participants || !newSchedule.cost_per_person) {
            showMessage('필수 필드를 모두 입력해주세요 (제목, 주소, 날짜, 최대 참여 인원, 예상 비용).', 'error');
            return;
        }

        try {
            let finalScheduleImageUrl = '';
            // 1. 새 파일이 선택되었다면 AWS S3에 직접 업로드
            if (selectedScheduleImageFile) {
                console.log('새 스케줄 이미지 업로드 중 (AWS S3 직접 업로드)...');
                const fileExtension = selectedScheduleImageFile.name.split('.').pop();
                const s3Key = `schedule_images/${userId}/${Date.now()}.${fileExtension}`;

                const arrayBuffer = await selectedScheduleImageFile.arrayBuffer();
                const bodyData = new Uint8Array(arrayBuffer);

                const command = new PutObjectCommand({
                    Bucket: awsConfig.bucketName,
                    Key: s3Key,
                    Body: bodyData,
                    ContentType: selectedScheduleImageFile.type,
                    ACL: 'public-read'
                });

                await s3Client.send(command);
                finalScheduleImageUrl = `https://${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com/${s3Key}`;
                console.log('AWS S3 직접 업로드 완료. URL:', finalScheduleImageUrl);
            }

            const dataToSend = {
                userId: userId,
                title: newSchedule.title,
                description: newSchedule.description,
                location_name: newSchedule.location_name,
                address: newSchedule.address,
                scheduled_date: newSchedule.scheduled_date,
                max_participants: parseInt(newSchedule.max_participants),
                cost_per_person: parseFloat(newSchedule.cost_per_person),
                schedule_image_url: finalScheduleImageUrl,
                user_type : userData.user_type,
            };
            console.log('생성할 스케줄 데이터:', dataToSend);

            const res = await axios.post('http://localhost:3001/createschedule', dataToSend);
            if (res.data.success) {
                showMessage('스케줄이 성공적으로 생성되었습니다!', 'success');
                handleCloseCreateModal();
                fetchSchedules();
            } else {
                showMessage(`스케줄 생성 실패: ${res.data.message}`, 'error');
            }
        } catch (error) {
            console.error('스케줄 생성 중 오류 발생:', error);
            showMessage('스케줄 생성 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
    };

    // --- 스케줄 수정 ---
    const updateSchedule = async () => {
        if (!userId || !editingSchedule || !editingSchedule.schedule_id) {
            showMessage('스케줄을 수정할 수 없습니다.', 'error');
            return;
        }

        if (!editingSchedule.title || !editingSchedule.address || !editingSchedule.scheduled_date || !editingSchedule.max_participants || !editingSchedule.cost_per_person) {
            showMessage('필수 필드를 모두 입력해주세요 (제목, 주소, 날짜, 최대 참여 인원, 예상 비용).', 'error');
            return;
        }

        try {
            let finalScheduleImageUrl = editingSchedule.schedule_image_url;

            // 1. 새 파일이 선택되었다면 AWS S3에 직접 업로드
            if (selectedScheduleImageFile) {
                console.log('스케줄 이미지 업데이트 중 (AWS S3 직접 업로드)...');
                const fileExtension = selectedScheduleImageFile.name.split('.').pop();
                const s3Key = `schedule_images/${Date.now()}.${fileExtension}`;

                const arrayBuffer = await selectedScheduleImageFile.arrayBuffer();
                const bodyData = new Uint8Array(arrayBuffer);

                const command = new PutObjectCommand({
                    Bucket: awsConfig.bucketName,
                    Key: s3Key,
                    Body: bodyData,
                    ContentType: selectedScheduleImageFile.type,
                    ACL: 'public-read'
                });

                await s3Client.send(command);
                finalScheduleImageUrl = `https://${awsConfig.bucketName}.s3.${awsConfig.region}.amazonaws.com/${s3Key}`;
                console.log('AWS S3 직접 업로드 완료. URL:', finalScheduleImageUrl);
            }

            const dataToSend = {
                userId: userId,
                scheduleId: editingSchedule.schedule_id,
                title: editingSchedule.title,
                description: editingSchedule.description,
                location_name: editingSchedule.location_name,
                address: editingSchedule.address,
                scheduled_date: editingSchedule.scheduled_date,
                max_participants: parseInt(editingSchedule.max_participants),
                cost_per_person: parseFloat(editingSchedule.cost_per_person),
                schedule_image_url: finalScheduleImageUrl,
            };
            console.log('수정할 스케줄 데이터:', dataToSend);

            const res = await axios.post('http://localhost:3001/updateSchedule', dataToSend);
            if (res.data.success) {
                showMessage('스케줄이 성공적으로 업데이트되었습니다!', 'success');
                handleCloseEditModal();
                fetchSchedules();
            } else {
                showMessage(`스케줄 업데이트 실패: ${res.data.message}`, 'error');
            }
        } catch (error) {
            console.error('스케줄 업데이트 중 오류 발생:', error);
            showMessage('스케줄 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
    };

    // --- 스케줄 삭제 ---
    const deleteSchedule = async (scheduleId) => {
        if (!window.confirm('정말로 이 스케줄을 삭제하시겠습니까? 관련 참여 요청도 모두 삭제됩니다.')) {
            return;
        }
        try {
            const res = await axios.post('http://localhost:3001/deleteSchedule', { userId, scheduleId });
            if (res.data.success) {
                showMessage('스케줄이 성공적으로 삭제되었습니다!', 'success');
                fetchSchedules();
            } else {
                showMessage(`스케줄 삭제 실패: ${res.data.message}`, 'error');
            }
        } catch (error) {
            console.error('스케줄 삭제 중 오류 발생:', error);
            showMessage('스케줄 삭제 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
        }
    };

    // --- 스케줄 멤버 불러오기 ---
    const fetchScheduleMembers = async (scheduleId) => {
        try {
            const res = await axios.get(`http://localhost:3001/schedule_members/${scheduleId}`);
            if (res.data.success) {
                setScheduleMembers(prev => ({
                    ...prev,
                    [scheduleId]: res.data.data
                }));
            } else {
                showMessage(`멤버 목록 로드 실패: ${res.data.message}`, 'error');
            }
        } catch (error) {
            console.error('스케줄 멤버 로드 중 오류 발생:', error);
            showMessage('참여자 목록을 불러오는 데 실패했습니다.', 'error');
        }
    };

    // --- 멤버 프로필 클릭 시 (모달 열기 및 프로필 데이터 가져오기) ---
    const handleMemberClickForProfile = async (e, scheduleId, memberId, reqStatus) => {
        e.stopPropagation();
        try {
            // 리액트에서 보낸 userId는 users 테이블의 user_id 컬럼과 비교할거야.
            const res = await axios.post('http://localhost:3001/mypage', { userId: memberId });
            if (res.data.success) {
                const memberProfile = res.data.data.user;
                setSelectedMemberProfile(memberProfile);
                setCurrentMemberStatusForModal(reqStatus);
                setIsProfileModalOpen(true);
            } else {
                showMessage(`프로필 로드 실패: ${res.data.message}`, 'error');
            }
        } catch (error) {
            console.error('멤버 프로필 로드 중 오류 발생:', error);
            showMessage('멤버 프로필을 불러오는 데 실패했습니다.', 'error');
        }
    };

    // --- 참여 요청 수락/거절 처리 ---
    const handleAcceptReject = async (actionType) => {
        if (!selectedScheduleForMembers || !selectedMemberProfile) return;

        const url = actionType === 'accept' ? 'http://localhost:3001/schedule/accept' : 'http://localhost:3001/schedule/reject';
        const message = actionType === 'accept' ? '수락' : '거절';

        try {
            const res = await axios.post(url, {
                scheduleId: selectedScheduleForMembers.schedule_id,
                reqUserId: selectedMemberProfile.user_id,
            });

            if (res.data.success) {
                showMessage(`참여 요청이 성공적으로 ${message}되었습니다!`, 'success');
                fetchScheduleMembers(selectedScheduleForMembers.schedule_id);
                handleCloseProfileModal();
                fetchSchedules();
            } else {
                showMessage(`참여 요청 ${message} 실패: ${res.data.message}`, 'error');
            }
        } catch (error) {
            console.error(`참여 요청 ${message} 중 오류 발생:`, error);
            showMessage(`참여 요청 ${message} 중 오류가 발생했습니다.`, 'error');
        }
    };

    return (
        <PageContainer>
            <Header>
                <Title>내 스케줄 관리</Title>
                <Button variant="primary" onClick={handleOpenCreateModal}>
                    <Plus size={20} />
                    새 스케줄 생성
                </Button>
            </Header>

            {message && (
                <MessageBar type={messageType}>
                    {message}
                </MessageBar>
            )}

            {schedules.length === 0 ? (
                <EmptyState>생성된 스케줄이 없습니다. 새로운 스케줄을 만들어 보세요!</EmptyState>
            ) : (
                <ScheduleGrid>
                    {schedules.map((schedule) => (
                        <ScheduleCard key={schedule.schedule_id}>
                            {schedule.schedule_image_url ? (
                                <CardImage src={schedule.schedule_image_url} alt="Schedule Image" />
                            ) : (
                                <CardImage as="div">No Image</CardImage>
                            )}
                            <CardContent>
                                <CardTitle>{schedule.title}</CardTitle>
                                <CardDescription>{schedule.description || '설명 없음'}</CardDescription>
                                <CardDetail>
                                    <strong>장소:</strong> {schedule.location_name || ''} ({schedule.address})
                                </CardDetail>
                                <CardDetail>
                                    <strong>날짜:</strong> {new Date(schedule.scheduled_date).toLocaleDateString('ko-KR')}
                                </CardDetail>
                                <CardDetail>
                                    <strong>참여자:</strong> {schedule.checked_people || 0} / {schedule.max_participants}명
                                </CardDetail>
                                <CardDetail>
                                    <strong>대기중:</strong> {schedule.pending_people || 0}명
                                </CardDetail>
                                <CardDetail>
                                    <strong>비용:</strong> {schedule.cost_per_person.toLocaleString()}원/인
                                </CardDetail>
                                <CardActions>
                                    <ActionButton type="members" onClick={() => handleOpenMembersModal(schedule)}>
                                        <Plus size={16} /> 참여자 ({schedule.checked_people + schedule.pending_people})
                                    </ActionButton>
                                    <ActionButton type="edit" onClick={() => handleOpenEditModal(schedule)}>
                                        <Edit size={16} /> 수정
                                    </ActionButton>
                                    <ActionButton type="delete" onClick={() => deleteSchedule(schedule.schedule_id)}>
                                        <Trash2 size={16} /> 삭제
                                    </ActionButton>
                                </CardActions>
                            </CardContent>
                        </ScheduleCard>
                    ))}
                </ScheduleGrid>
            )}

            {/* 새 스케줄 생성 모달 */}
            {isCreateModalOpen && (
                <ModalOverlay onClick={handleCloseCreateModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>새 스케줄 생성</ModalTitle>
                            <CloseButton onClick={handleCloseCreateModal}>닫기</CloseButton>
                        </ModalHeader>
                        {message && (
                            <MessageBar type={messageType}>
                                {message}
                            </MessageBar>
                        )}
                        {/* 이미지 업로드 UI 추가 */}
                        <AvatarContainer>
                            <AvatarWrapper>
                                <Avatar>
                                    {newSchedule.schedule_image_url ? (
                                        <AvatarImage src={newSchedule.schedule_image_url} alt="Schedule Preview" />
                                    ) : (
                                        <AvatarFallback>No Image</AvatarFallback>
                                    )}
                                </Avatar>
                                <CameraButton type="button" onClick={() => handleImageClick(true)}>
                                    <Camera size={16} />
                                </CameraButton>
                                <HiddenInput
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageSelect(e, true)}
                                />
                            </AvatarWrapper>
                            <HelpText>스케줄 대표 이미지를 변경하려면 카메라 아이콘을 클릭하세요</HelpText>
                        </AvatarContainer>
                        <FormGroup>
                            <Label htmlFor="create-title">제목</Label>
                            <Input
                                id="create-title"
                                type="text"
                                name="title"
                                value={newSchedule.title}
                                onChange={handleNewScheduleChange}
                                placeholder="스케줄 제목"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="create-description">설명</Label>
                            <Textarea
                                id="create-description"
                                name="description"
                                value={newSchedule.description}
                                onChange={handleNewScheduleChange}
                                placeholder="스케줄에 대한 자세한 설명"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="create-location-name">장소명 (선택)</Label>
                            <Input
                                id="create-location-name"
                                type="text"
                                name="location_name"
                                value={newSchedule.location_name}
                                onChange={handleNewScheduleChange}
                                placeholder="예: 강남역 스타벅스"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="create-address">주소</Label>
                            <Input
                                id="create-address"
                                type="text"
                                name="address"
                                value={newSchedule.address}
                                onChange={handleNewScheduleChange}
                                placeholder="예: 서울 강남구 테헤란로 123"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="create-date">날짜</Label>
                            <Input
                                id="create-date"
                                type="date"
                                name="scheduled_date"
                                value={newSchedule.scheduled_date}
                                onChange={handleNewScheduleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="create-max-participants">최대 참여 인원</Label>
                            <Input
                                id="create-max-participants"
                                type="number"
                                name="max_participants"
                                value={newSchedule.max_participants}
                                onChange={handleNewScheduleChange}
                                placeholder="최대 참여 가능한 인원"
                                min="1"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="create-cost">예상 비용 (1인당)</Label>
                            <Input
                                id="create-cost"
                                type="number"
                                name="cost_per_person"
                                value={newSchedule.cost_per_person}
                                onChange={handleNewScheduleChange}
                                placeholder="1인당 예상 비용 (원)"
                                min="0"
                            />
                        </FormGroup>
                        <FormActions>
                            <Button variant="outline" onClick={handleCloseCreateModal}>
                                <X size={16} /> 취소
                            </Button>
                            <Button variant="primary" onClick={createSchedule}>
                                <Save size={16} /> 생성
                            </Button>
                        </FormActions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* 스케줄 수정 모달 */}
            {isEditModalOpen && editingSchedule && (
                <ModalOverlay onClick={handleCloseEditModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>스케줄 수정</ModalTitle>
                            <CloseButton onClick={handleCloseEditModal}>닫기</CloseButton>
                        </ModalHeader>
                        {message && (
                            <MessageBar type={messageType}>
                                {message}
                            </MessageBar>
                        )}
                        <AvatarContainer>
                            <AvatarWrapper>
                                <Avatar>
                                    {editingSchedule.schedule_image_url ? (
                                        <AvatarImage src={editingSchedule.schedule_image_url} alt="Schedule Preview" />
                                    ) : (
                                        <AvatarFallback>No Image</AvatarFallback>
                                    )}
                                </Avatar>
                                <CameraButton type="button" onClick={() => handleImageClick(false)}>
                                    <Camera size={16} />
                                </CameraButton>
                                <HiddenInput
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageSelect(e, false)}
                                />
                            </AvatarWrapper>
                            <HelpText>스케줄 대표 이미지를 변경하려면 카메라 아이콘을 클릭하세요</HelpText>
                        </AvatarContainer>
                        <FormGroup>
                            <Label htmlFor="edit-title">제목</Label>
                            <Input
                                id="edit-title"
                                type="text"
                                name="title"
                                value={editingSchedule.title}
                                onChange={handleEditingScheduleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="edit-description">설명</Label>
                            <Textarea
                                id="edit-description"
                                name="description"
                                value={editingSchedule.description}
                                onChange={handleEditingScheduleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="edit-location-name">장소명 (선택)</Label>
                            <Input
                                id="edit-location-name"
                                type="text"
                                name="location_name"
                                value={editingSchedule.location_name}
                                onChange={handleEditingScheduleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="edit-address">주소</Label>
                            <Input
                                id="edit-address"
                                type="text"
                                name="address"
                                value={editingSchedule.address}
                                onChange={handleEditingScheduleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="edit-date">날짜</Label>
                            <Input
                                id="edit-date"
                                type="date"
                                name="scheduled_date"
                                value={editingSchedule.scheduled_date}
                                onChange={handleEditingScheduleChange}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="edit-max-participants">최대 참여 인원</Label>
                            <Input
                                id="edit-max-participants"
                                type="number"
                                name="max_participants"
                                value={editingSchedule.max_participants}
                                onChange={handleEditingScheduleChange}
                                min="1"
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor="edit-cost">예상 비용 (1인당)</Label>
                            <Input
                                id="edit-cost"
                                type="number"
                                name="cost_per_person"
                                value={editingSchedule.cost_per_person}
                                onChange={handleEditingScheduleChange}
                                min="0"
                            />
                        </FormGroup>
                        <FormActions>
                            <Button variant="outline" onClick={handleCloseEditModal}>
                                <X size={16} /> 취소
                            </Button>
                            <Button variant="primary" onClick={updateSchedule}>
                                <Save size={16} /> 저장
                            </Button>
                        </FormActions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* 스케줄 참여자 확인 모달 */}
            {isMembersModalOpen && selectedScheduleForMembers && (
                <ModalOverlay onClick={handleCloseMembersModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{selectedScheduleForMembers.title} 참여자 목록</ModalTitle>
                            <CloseButton onClick={handleCloseMembersModal}>닫기</CloseButton>
                        </ModalHeader>
                        <ScheduleMembersSection style={{ borderTop: 'none', paddingTop: '0' }}>
                            <SectionTitle>참여 요청 ({scheduleMembers[selectedScheduleForMembers.schedule_id]?.length || 0}건)</SectionTitle>
                            {scheduleMembers[selectedScheduleForMembers.schedule_id]?.length > 0 ? (
                                <MemberList>
                                    {scheduleMembers[selectedScheduleForMembers.schedule_id].map((member) => (
                                        <MemberItem
                                            key={member.req_user_id}
                                            onClick={(e) => handleMemberClickForProfile(e, selectedScheduleForMembers.schedule_id, member.req_user_id, member.req_status)}
                                        >
                                            <MemberInfo>
                                                <MemberName>{member.user_name} ({member.req_user_id})</MemberName>
                                                <MemberStatus status={member.req_status}>
                                                    {member.req_status === 0 && '대기중❕'}
                                                    {member.req_status === 1 && '수락됨✅'}
                                                    {member.req_status === 2 && '거절됨❌'}
                                                </MemberStatus>
                                            </MemberInfo>
                                        </MemberItem>
                                    ))}
                                </MemberList>
                            ) : (
                                <p>아직 참여 요청이 없습니다.</p>
                            )}
                        </ScheduleMembersSection>
                        <ProfileActions>
                            <ActionButton type="close" onClick={handleCloseMembersModal}>
                                닫기
                            </ActionButton>
                        </ProfileActions>
                    </ModalContent>
                </ModalOverlay>
            )}

            {/* 프로필 모달 (가장 높은 z-index) */}
            {isProfileModalOpen && selectedMemberProfile && (
                <ModalOverlayProfile onClick={handleCloseProfileModal}>
                    <ModalContent onClick={(e) => e.stopPropagation()}>
                        <ModalHeader>
                            <ModalTitle>{selectedMemberProfile.user_id}님의 프로필</ModalTitle>
                            <CloseButton onClick={handleCloseProfileModal}>닫기</CloseButton>
                        </ModalHeader>
                        <ProfileImageContainer>
                            {selectedMemberProfile.profile_image_url ? (
                                <ProfileImage src={selectedMemberProfile.profile_image_url} alt="프로필 이미지" />
                            ) : (
                                <ProfileImage src="/default-profile.png" alt="기본 프로필 이미지" />
                            )}
                        </ProfileImageContainer>
                        <div>
                            <ProfileDetail><strong>닉네임:</strong> {selectedMemberProfile.nickname}</ProfileDetail>
                            <ProfileDetail><strong>성별:</strong> {selectedMemberProfile.gender}</ProfileDetail>
                            <ProfileDetail><strong>생년월일:</strong> {new Date(selectedMemberProfile.birth_date).toLocaleDateString('ko-KR')}</ProfileDetail>
                            <ProfileDetail><strong>휴대폰:</strong> {selectedMemberProfile.phone_number}</ProfileDetail>
                            <ProfileDetail><strong>mbti:</strong> {selectedMemberProfile.mbti}</ProfileDetail>
                            <ProfileDetail><strong>자기소개:</strong> {selectedMemberProfile.introduce || '없음'}</ProfileDetail>
                        </div>
                        <ProfileActions>
                            {currentMemberStatusForModal === 0 && (
                                <>
                                    <ActionButton type="accept" onClick={() => handleAcceptReject('accept')}>
                                        수락
                                    </ActionButton>
                                    <ActionButton type="reject" onClick={() => handleAcceptReject('reject')}>
                                        거절
                                    </ActionButton>
                                </>
                            )}
                            <ActionButton type="close" onClick={handleCloseProfileModal}>
                                닫기
                            </ActionButton>
                        </ProfileActions>
                    </ModalContent>
                </ModalOverlayProfile>
            )}
        </PageContainer>
    );
}