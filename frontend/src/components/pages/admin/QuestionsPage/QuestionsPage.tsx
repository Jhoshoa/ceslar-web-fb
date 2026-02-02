import { useState, SyntheticEvent, ChangeEvent } from 'react';
import { Container, Box, Tabs, Tab, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useTranslation } from 'react-i18next';
import {
  useGetQuestionsQuery,
  useGetQuestionCategoriesQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} from '../../../../store/api/questionsApi';
import FormDialog from '../../../organisms/FormDialog/FormDialog';
import ConfirmDialog from '../../../organisms/ConfirmDialog/ConfirmDialog';
import Typography from '../../../atoms/Typography/Typography';
import Button from '../../../atoms/Button/Button';
import Chip from '../../../atoms/Chip/Chip';
import FormField from '../../../molecules/FormField/FormField';

interface LocalizedString {
  es?: string;
  en?: string;
  pt?: string;
  [key: string]: string | undefined;
}

interface QuestionCategory {
  id: string;
  name: string | LocalizedString;
}

interface Question {
  id: string;
  text: string | LocalizedString;
  type: string;
  required?: boolean;
  categoryId?: string;
}

interface QuestionForm {
  text: string;
  type: string;
  required: boolean;
  categoryId: string;
}

interface DialogState {
  open: boolean;
  question: Question | null;
}

const QuestionsPage = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'es';

  const [tab, setTab] = useState(0);
  const [dialog, setDialog] = useState<DialogState>({ open: false, question: null });
  const [deleteConfirm, setDeleteConfirm] = useState<Question | null>(null);
  const [form, setForm] = useState<QuestionForm>({ text: '', type: 'text', required: false, categoryId: '' });

  const { data: categories } = useGetQuestionCategoriesQuery();
  const categoryList: QuestionCategory[] = categories?.data || [];
  const selectedCategory = categoryList[tab];
  const { data: questionsData, isLoading } = useGetQuestionsQuery(
    { categoryId: selectedCategory?.id },
    { skip: !selectedCategory?.id }
  );
  const [createQuestion, { isLoading: creating }] = useCreateQuestionMutation();
  const [updateQuestion, { isLoading: updating }] = useUpdateQuestionMutation();
  const [deleteQuestion, { isLoading: deleting }] = useDeleteQuestionMutation();

  const questions: Question[] = questionsData?.data || [];

  const getLocalizedText = (text: string | LocalizedString | undefined): string => {
    if (!text) return '';
    if (typeof text === 'string') return text;
    return text[lang] || text.es || '';
  };

  const openCreate = () => {
    setForm({ text: '', type: 'text', required: false, categoryId: selectedCategory?.id || '' });
    setDialog({ open: true, question: null });
  };

  const openEdit = (question: Question) => {
    setForm({
      text: getLocalizedText(question.text),
      type: question.type || 'text',
      required: question.required || false,
      categoryId: question.categoryId || selectedCategory?.id || '',
    });
    setDialog({ open: true, question });
  };

  const handleSave = async () => {
    const payload = {
      text: { [lang]: form.text },
      type: form.type,
      required: form.required,
      categoryId: form.categoryId,
    };
    if (dialog.question) {
      await updateQuestion({ id: dialog.question.id, ...payload });
    } else {
      await createQuestion(payload);
    }
    setDialog({ open: false, question: null });
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteQuestion(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleFormChange = (field: keyof QuestionForm) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('admin.questions.pageTitle', 'Constructor de Preguntas')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate} disabled={!selectedCategory}>
          {t('admin.questions.add', 'Nueva Pregunta')}
        </Button>
      </Box>

      {/* Category Tabs */}
      {categoryList.length > 0 && (
        <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
          {categoryList.map((cat) => {
            const catName = getLocalizedText(cat.name);
            return <Tab key={cat.id} label={catName} />;
          })}
        </Tabs>
      )}

      {/* Questions List */}
      <Paper elevation={1}>
        {isLoading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">{t('common.loading', 'Cargando...')}</Typography>
          </Box>
        ) : questions.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="textSecondary">
              {t('admin.questions.empty', 'No hay preguntas en esta categoría')}
            </Typography>
          </Box>
        ) : (
          <List>
            {questions.map((question, index) => {
              const questionText = getLocalizedText(question.text);
              return (
                <ListItem
                  key={question.id}
                  divider={index < questions.length - 1}
                  secondaryAction={
                    <Box>
                      <IconButton size="small" onClick={() => openEdit(question)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirm(question)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <DragIndicatorIcon sx={{ color: 'text.disabled', mr: 2, cursor: 'grab' }} />
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{questionText}</Typography>
                        {question.required && <Chip label="*" size="small" color="error" sx={{ minWidth: 20, height: 20 }} />}
                      </Box>
                    }
                    secondary={`${t('admin.questions.type', 'Tipo')}: ${question.type}`}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>

      <FormDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false, question: null })}
        onSubmit={handleSave}
        title={dialog.question ? t('admin.questions.edit', 'Editar Pregunta') : t('admin.questions.add', 'Nueva Pregunta')}
        loading={creating || updating}
      >
        <FormField label={t('admin.questions.text', 'Texto')} name="text" value={form.text}
          onChange={handleFormChange('text')} required multiline rows={2} />
        <FormField label={t('admin.questions.type', 'Tipo')} name="type" value={form.type}
          onChange={handleFormChange('type')}
          description="text, textarea, select, radio, checkbox, date, number" />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title={t('admin.questions.deleteTitle', '¿Eliminar pregunta?')}
        loading={deleting}
        destructive
      />
    </Container>
  );
};

export default QuestionsPage;
