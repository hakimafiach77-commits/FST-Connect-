import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ModulesManager from './ModulesManager';
import TeacherModules from './enseignant/TeacherModules';

const ModulesRouter = () => {
  const { isTeacher, isAdmin } = useAuth();
  
  if (isTeacher() && !isAdmin()) {
    return <TeacherModules />;
  }
  
  return <ModulesManager />;
};

export default ModulesRouter;
