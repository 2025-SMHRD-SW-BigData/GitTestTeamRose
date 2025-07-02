import React from 'react'
import { AuthSidebar } from './AuthSiderbar'
import { Typography, Grid, Paper } from "@mui/material";
import { motion } from "framer-motion";

import PeopleIcon from '@mui/icons-material/People';
import MapIcon from '@mui/icons-material/Map';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const features = [
  {
    icon: <PeopleIcon style={{ fontSize: 50, color: "#3b82f6" }} />,
    title: "일정 기반 매칭",
    description: "레저 일정을 만들고, 같은 시간대에 활동할 사람을 찾아보세요.",
  },
  {
    icon: <MapIcon style={{ fontSize: 50, color: "#3b82f6" }} />,
    title: "전국 지도 서비스",
    description: "해수욕장, 맛집, 레저 업체 정보를 지도 한 페이지에!",
  },
  {
    icon: <CameraAltIcon style={{ fontSize: 50, color: "#3b82f6" }} />,
    title: "사진으로 보는 장소",
    description: "사용자가 직접 올린 사진으로 장소의 분위기를 미리 확인하세요.",
  },
];

const Start = ({ isOpen, onClose, initialMode, onOpen }) => {
  return (
    <div>

      <AuthSidebar isOpen={isOpen} onClose={onClose} initialMode={initialMode} />

      <div style={{ backgroundColor: 'black', }}>
        <br />
        <br />

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            duration: 1.4,
            y: { duration: 1 }
          }}
          viewport={{ once: true }}
          style={{ marginTop: '250px' }}>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(to right, #8b5cf6, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <h1>SeaU</h1>
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{
            ease: "easeInOut",
            duration: 2,
            y: { duration: 1 },
          }}
          viewport={{ once: true }}
          style={{ color: 'white' }}
        >
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0'}}>
              제주 해변 여행의 모든 것, 한 곳에서
            </h2>
          </div>
        </motion.div>
        <br />
        <br />
        <br />
        <Grid container direction='column' spacing={3} justifyContent="center" style={{ padding: '100px 20px', backgroundColor: 'black' }}>
          {features.map((feature, idx) => (
            <Grid sx={{ gridColumn: 'span 12' }} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <Paper elevation={4} style={{ padding: '30px 20px', backgroundColor: '#1e1e1e', color: 'white', borderRadius: '12px', textAlign: 'center', height: '100%',             maxWidth: '400px',
            margin: '0 auto' }}>
                  <div>{feature.icon}</div>
                  <Typography variant="h6" style={{ marginTop: '16px', fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" style={{ marginTop: '8px', color: '#ccc' }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ ease: "easeOut", duration: 2, y: { duration: 1 }, }}
          viewport={{ once: true }}
          style={{
            backgroundColor: 'black',
            padding: '100px 20px',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            지금 바로 SeaU에 가입하고<br />당신의 여정을 시작해보세요!
          </h2>

          <button
            style={{
              background: "linear-gradient(to right, #8b5cf6, #3b82f6)",
              color: 'white',
              border: 'none',
              padding: '15px 30px',
              fontSize: '1.2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              "&:hover": {
                background: "linear-gradient(to right, #7c3aed, #2563eb)",
              },
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            onClick={() => onOpen('login')}
          >
            지금 시작하기
          </button>
        </motion.div>

        <div style={{height:'100px'}}>

        </div>

      </div>



    </div>


  )
}

export default Start