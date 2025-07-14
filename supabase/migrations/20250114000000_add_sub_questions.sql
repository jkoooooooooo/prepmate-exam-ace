-- Add sub-questions functionality to the questions table
-- Add a parent_question_id column to create question hierarchies
ALTER TABLE public.questions
ADD COLUMN parent_question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE;

-- Add index for faster querying of sub-questions
CREATE INDEX idx_questions_parent_question_id ON public.questions(parent_question_id);

-- Add a column to determine if this is a sub-question or base question
ALTER TABLE public.questions
ADD COLUMN question_type TEXT NOT NULL DEFAULT 'base' CHECK (question_type IN ('base', 'sub'));

-- Add order column for sub-questions to maintain sequence
ALTER TABLE public.questions
ADD COLUMN sub_question_order INTEGER DEFAULT 0;

-- Add trigger answer condition - what answer triggers this sub-question
ALTER TABLE public.questions
ADD COLUMN trigger_answer_index INTEGER;

-- Add a function to get all sub-questions for a given question
CREATE OR REPLACE FUNCTION public.get_sub_questions(question_id UUID)
RETURNS SETOF public.questions
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.questions 
  WHERE parent_question_id = question_id 
  ORDER BY sub_question_order ASC;
$$;

-- Add a function to get the complete question hierarchy
CREATE OR REPLACE FUNCTION public.get_question_hierarchy(base_question_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  result JSONB;
  base_question RECORD;
  sub_questions JSONB;
BEGIN
  -- Get the base question
  SELECT * INTO base_question FROM public.questions WHERE id = base_question_id AND question_type = 'base';
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Get all sub-questions
  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', id,
        'question', question,
        'options', options,
        'correct_answer', correct_answer,
        'explanation', explanation,
        'subject', subject,
        'difficulty', difficulty,
        'trigger_answer_index', trigger_answer_index,
        'sub_question_order', sub_question_order
      ) ORDER BY sub_question_order
    ),
    '[]'::jsonb
  ) INTO sub_questions
  FROM public.questions 
  WHERE parent_question_id = base_question_id;
  
  -- Build the complete hierarchy
  result := jsonb_build_object(
    'id', base_question.id,
    'question', base_question.question,
    'options', base_question.options,
    'correct_answer', base_question.correct_answer,
    'explanation', base_question.explanation,
    'subject', base_question.subject,
    'difficulty', base_question.difficulty,
    'question_type', base_question.question_type,
    'sub_questions', sub_questions
  );
  
  RETURN result;
END;
$$;

-- Update the existing sample questions to be base questions
UPDATE public.questions SET question_type = 'base' WHERE question_type IS NULL OR question_type = '';

-- Insert some sample sub-questions
-- Sub-questions for the France capital question (if they answered correctly)
INSERT INTO public.questions (question, options, correct_answer, explanation, subject, difficulty, question_type, parent_question_id, trigger_answer_index, sub_question_order) 
SELECT 
  'Which river flows through Paris?',
  '["Thames", "Seine", "Danube", "Rhine"]', 
  1, 
  'The Seine river flows through the heart of Paris, dividing the city into the Left and Right banks.',
  'Geography', 
  'medium',
  'sub',
  id,
  2,  -- Triggered when correct answer (Paris) is selected
  1   -- First sub-question
FROM public.questions WHERE question = 'What is the capital of France?' LIMIT 1;

-- Another sub-question for France
INSERT INTO public.questions (question, options, correct_answer, explanation, subject, difficulty, question_type, parent_question_id, trigger_answer_index, sub_question_order) 
SELECT 
  'What is the famous tower in Paris called?',
  '["Big Ben", "Eiffel Tower", "Leaning Tower", "CN Tower"]', 
  1, 
  'The Eiffel Tower is an iconic iron lattice tower located in Paris, built in 1889.',
  'Geography', 
  'easy',
  'sub',
  id,
  2,  -- Triggered when correct answer (Paris) is selected
  2   -- Second sub-question
FROM public.questions WHERE question = 'What is the capital of France?' LIMIT 1;

-- Add sub-questions for the Mars question
INSERT INTO public.questions (question, options, correct_answer, explanation, subject, difficulty, question_type, parent_question_id, trigger_answer_index, sub_question_order) 
SELECT 
  'How many moons does Mars have?',
  '["0", "1", "2", "4"]', 
  2, 
  'Mars has two small moons: Phobos and Deimos, named after the Greek gods of fear and panic.',
  'Science', 
  'hard',
  'sub',
  id,
  1,  -- Triggered when correct answer (Mars) is selected
  1   -- First sub-question
FROM public.questions WHERE question = 'Which planet is known as the Red Planet?' LIMIT 1;