import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockCourses } from '@/data/mockData.js';

const CoursesContext = createContext();

export const CoursesProvider = ({ children }) => {
  const [courses, setCourses] = useState([]);
  const [courseStatuses, setCourseStatuses] = useState({});
  const [codes, setCodes] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const savedCourses = localStorage.getItem('courses_data');
    if (savedCourses) {
      setCourses(JSON.parse(savedCourses));
    } else {
      setCourses(mockCourses);
      localStorage.setItem('courses_data', JSON.stringify(mockCourses));
    }

    const savedStatuses = localStorage.getItem('courseStatuses');
    if (savedStatuses) {
      setCourseStatuses(JSON.parse(savedStatuses));
    } else {
      const initial = mockCourses.reduce((acc, c) => ({ ...acc, [c.id]: 'locked' }), {});
      setCourseStatuses(initial);
      localStorage.setItem('courseStatuses', JSON.stringify(initial));
    }

    const savedCodes = localStorage.getItem('activation_codes');
    if (savedCodes) setCodes(JSON.parse(savedCodes));

    const savedRequests = localStorage.getItem('subscription_requests');
    if (savedRequests) setRequests(JSON.parse(savedRequests));
  }, []);

  const saveCourses = (newCourses) => {
    setCourses(newCourses);
    localStorage.setItem('courses_data', JSON.stringify(newCourses));
  };

  const addCourse = (course) => {
    const newCourse = { ...course, id: `c${Date.now()}`, status: 'active' };
    saveCourses([...courses, newCourse]);
  };

  const editCourse = (id, updatedData) => {
    saveCourses(courses.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const deleteCourse = (id) => {
    saveCourses(courses.filter(c => c.id !== id));
  };

  const updateCourseStatus = (courseId, status) => {
    const newStatuses = { ...courseStatuses, [courseId]: status };
    setCourseStatuses(newStatuses);
    localStorage.setItem('courseStatuses', JSON.stringify(newStatuses));
  };

  const activateCourse = (courseId, codeStr, userEmail) => {
    const codeIndex = codes.findIndex(c => c.code === codeStr && c.courseId === courseId && c.status === 'unused');
    if (codeIndex >= 0) {
      const newCodes = [...codes];
      newCodes[codeIndex] = { ...newCodes[codeIndex], status: 'used', usedBy: userEmail };
      setCodes(newCodes);
      localStorage.setItem('activation_codes', JSON.stringify(newCodes));
      updateCourseStatus(courseId, 'active');
      return true;
    }
    return false;
  };

  const requestCourse = (courseId, user) => {
    const newRequest = {
      id: `req${Date.now()}`,
      courseId,
      courseName: courses.find(c => c.id === courseId)?.title,
      userName: user.name,
      userEmail: user.email,
      date: new Date().toISOString(),
      status: 'pending'
    };
    const newRequests = [...requests, newRequest];
    setRequests(newRequests);
    localStorage.setItem('subscription_requests', JSON.stringify(newRequests));
    updateCourseStatus(courseId, 'pending');
    return true;
  };

  const generateCodes = (courseId, quantity) => {
    const newCodes = Array.from({ length: quantity }).map(() => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      courseId,
      courseName: courses.find(c => c.id === courseId)?.title,
      status: 'unused',
      date: new Date().toISOString(),
      usedBy: null
    }));
    const updatedCodes = [...codes, ...newCodes];
    setCodes(updatedCodes);
    localStorage.setItem('activation_codes', JSON.stringify(updatedCodes));
  };

  const updateRequestStatus = (requestId, status) => {
    const req = requests.find(r => r.id === requestId);
    if (req) {
      const newRequests = requests.map(r => r.id === requestId ? { ...r, status } : r);
      setRequests(newRequests);
      localStorage.setItem('subscription_requests', JSON.stringify(newRequests));
      if (status === 'approved') {
        updateCourseStatus(req.courseId, 'active');
      } else if (status === 'rejected') {
        updateCourseStatus(req.courseId, 'locked');
      }
    }
  };

  return (
    <CoursesContext.Provider value={{ 
      courses, 
      courseStatuses, 
      codes,
      requests,
      addCourse,
      editCourse,
      deleteCourse,
      activateCourse, 
      requestCourse,
      updateCourseStatus,
      generateCodes,
      updateRequestStatus
    }}>
      {children}
    </CoursesContext.Provider>
  );
};

export const useCourses = () => useContext(CoursesContext);