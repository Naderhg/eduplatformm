import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Education Platform API',
      version,
      description: 'API documentation for the Education Platform',
      contact: {
        name: 'API Support',
        email: 'support@educationplatform.com',
      },
    },
    servers: [
      {
        url: 'https://p01--edu-platform--fnj72wsf9xl6.code.run/api',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated ID of the user',
            },
            name: {
              type: 'string',
              description: 'The name of the user',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'The email of the user',
            },
            role: {
              type: 'string',
              enum: ['STUDENT', 'TEACHER'],
              description: 'The role of the user',
            },
            avatar: {
              type: 'string',
              description: 'URL to the user\'s avatar',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date when the user was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date when the user was last updated',
            },
          },
        },
        Course: {
          type: 'object',
          required: ['title', 'description', 'category', 'level', 'duration', 'requirements', 'learningOutcomes'],
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated ID of the course',
            },
            title: {
              type: 'string',
              description: 'The title of the course',
            },
            description: {
              type: 'string',
              description: 'A detailed description of the course',
            },
            category: {
              type: 'string',
              description: 'The category of the course',
            },
            level: {
              type: 'string',
              enum: ['preparatory', 'secondary'],
              description: 'The education level this course is intended for',
            },
            duration: {
              type: 'integer',
              description: 'Duration of the course in hours',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'archived'],
              default: 'draft',
              description: 'The current status of the course',
            },
            requirements: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of requirements for the course',
            },
            learningOutcomes: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'List of learning outcomes for the course',
            },
            thumbnail: {
              type: 'string',
              format: 'uri',
              description: 'URL to the course thumbnail image',
            },
            videoUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to the course introduction video',
            },
            files: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/CourseFile',
              },
              description: 'List of files associated with the course',
            },
            teacher: {
              $ref: '#/components/schemas/User',
            },
            studentsCount: {
              type: 'integer',
              default: 0,
              description: 'Number of students enrolled in the course',
            },
            lessonsCount: {
              type: 'integer',
              default: 0,
              description: 'Number of lessons in the course',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the course was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the course was last updated',
            },
          },
        },
        CourseFile: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated ID of the file',
            },
            name: {
              type: 'string',
              description: 'The name of the file',
            },
            type: {
              type: 'string',
              description: 'The MIME type of the file',
            },
            size: {
              type: 'integer',
              description: 'The size of the file in bytes',
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'URL to access the file',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the file was uploaded',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            token: {
              type: 'string',
              description: 'JWT token for authentication',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
            error: {
              type: 'object',
              description: 'Error details (only in development)',
            },
          },
        },
        Assignment: {
          type: 'object',
          required: ['title', 'description', 'course', 'dueDate', 'type', 'questions'],
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated ID of the assignment',
            },
            title: {
              type: 'string',
              description: 'The title of the assignment',
            },
            description: {
              type: 'string',
              description: 'A detailed description of the assignment',
            },
            course: {
              type: 'string',
              description: 'The ID of the course this assignment belongs to',
            },
            lesson: {
              type: 'string',
              description: 'The ID of the lesson this assignment belongs to (optional)',
            },
            availableFrom: {
              type: 'string',
              format: 'date-time',
              description: 'When the assignment becomes available to students',
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'The due date for the assignment',
            },
            maxScore: {
              type: 'integer',
              description: 'Maximum possible score for the assignment',
            },
            type: {
              type: 'string',
              enum: ['mcq', 'essay', 'mixed'],
              description: 'The type of assignment',
            },
            questions: {
              type: 'object',
              properties: {
                mcq: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/MCQQuestion'
                  }
                },
                essay: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/EssayQuestion'
                  }
                }
              }
            },
            autoCorrect: {
              type: 'boolean',
              description: 'Whether MCQ questions are auto-graded',
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'closed'],
              default: 'draft',
              description: 'The current status of the assignment',
            },
            teacher: {
              type: 'string',
              description: 'The ID of the teacher who created the assignment',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the assignment was created',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'The date and time when the assignment was last updated',
            },
          },
        },
        MCQQuestion: {
          type: 'object',
          required: ['question', 'options', 'correctAnswer', 'points'],
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated ID of the question',
            },
            question: {
              type: 'string',
              description: 'The question text',
            },
            options: {
              type: 'array',
              items: {
                type: 'string'
              },
              minItems: 2,
              maxItems: 6,
              description: 'Array of answer options',
            },
            correctAnswer: {
              type: 'integer',
              minimum: 0,
              description: 'Index of the correct answer in the options array',
            },
            points: {
              type: 'integer',
              minimum: 1,
              description: 'Points awarded for correct answer',
            },
          },
        },
        EssayQuestion: {
          type: 'object',
          required: ['question', 'points'],
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated ID of the question',
            },
            question: {
              type: 'string',
              description: 'The question text',
            },
            maxWords: {
              type: 'integer',
              minimum: 50,
              description: 'Maximum number of words allowed for the answer',
            },
            points: {
              type: 'integer',
              minimum: 1,
              description: 'Points awarded for this question',
            },
          },
        },
        Submission: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'The auto-generated ID of the submission',
            },
            assignment: {
              type: 'string',
              description: 'The ID of the assignment being submitted',
            },
            student: {
              type: 'string',
              description: 'The ID of the student submitting',
            },
            mcqAnswers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/MCQAnswer'
              },
              description: 'Answers to MCQ questions',
            },
            essayAnswers: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/EssayAnswer'
              },
              description: 'Answers to essay questions',
            },
            content: {
              type: 'string',
              description: 'General submission content (backward compatibility)',
            },
            attachmentUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL to attached file',
            },
            score: {
              type: 'integer',
              description: 'Total score awarded',
            },
            maxScore: {
              type: 'integer',
              description: 'Maximum possible score',
            },
            autoGraded: {
              type: 'boolean',
              description: 'Whether the submission was auto-graded',
            },
            feedback: {
              type: 'string',
              description: 'Teacher feedback on the submission',
            },
            submittedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the assignment was submitted',
            },
            gradedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the submission was graded',
            },
          },
        },
        MCQAnswer: {
          type: 'object',
          required: ['questionId', 'selectedAnswer', 'isCorrect', 'points'],
          properties: {
            questionId: {
              type: 'string',
              description: 'ID of the MCQ question',
            },
            selectedAnswer: {
              type: 'integer',
              description: 'Index of the selected answer',
            },
            isCorrect: {
              type: 'boolean',
              description: 'Whether the answer is correct',
            },
            points: {
              type: 'integer',
              description: 'Points awarded for this answer',
            },
          },
        },
        EssayAnswer: {
          type: 'object',
          required: ['questionId', 'answer', 'wordCount'],
          properties: {
            questionId: {
              type: 'string',
              description: 'ID of the essay question',
            },
            answer: {
              type: 'string',
              description: 'The student\'s answer',
            },
            wordCount: {
              type: 'integer',
              description: 'Number of words in the answer',
            },
            points: {
              type: 'integer',
              description: 'Points awarded for this answer',
            },
            feedback: {
              type: 'string',
              description: 'Feedback on this specific answer',
            },
          },
        },
      },
    },
    paths: {
      '/courses': {
        get: {
          tags: ['Courses'],
          summary: 'Get all courses',
          description: 'Returns a list of all courses with optional filtering',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'teacherId',
              in: 'query',
              description: 'Filter courses by teacher ID',
              required: false,
              schema: {
                type: 'string'
              }
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter courses by status',
              required: false,
              schema: {
                type: 'string',
                enum: ['draft', 'published', 'archived']
              }
            }
          ],
          responses: {
            '200': {
              description: 'A list of courses',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Course'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '500': {
              description: 'Server error'
            }
          }
        },
        post: {
          tags: ['Courses'],
          summary: 'Create a new course',
          description: 'Create a new course with the provided data',
          security: [{
            bearerAuth: []
          }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Course'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Course created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Course'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input data'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not a teacher'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/courses/{id}': {
        get: {
          tags: ['Courses'],
          summary: 'Get course by ID',
          description: 'Returns a single course by ID',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the course to retrieve',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Course found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Course'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '404': {
              description: 'Course not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        },
        put: {
          tags: ['Courses'],
          summary: 'Update a course',
          description: 'Update an existing course by ID',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the course to update',
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Course'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Course updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Course'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the course'
            },
            '404': {
              description: 'Course not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        },
        delete: {
          tags: ['Courses'],
          summary: 'Delete a course',
          description: 'Delete a course by ID',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the course to delete',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '204': {
              description: 'Course deleted successfully'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the course'
            },
            '404': {
              description: 'Course not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/courses/{id}/publish': {
        patch: {
          tags: ['Courses'],
          summary: 'Publish a course',
          description: 'Change the status of a course to published',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the course to publish',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Course published successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Course'
                  }
                }
              }
            },
            '400': {
              description: 'Course is already published or invalid status change'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the course'
            },
            '404': {
              description: 'Course not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/assignments': {
        post: {
          tags: ['Assignments'],
          summary: 'Create a new assignment',
          description: 'Create a new assignment with the provided data',
          security: [{
            bearerAuth: []
          }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Assignment'
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Assignment created successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Assignment'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input data'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not a teacher'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/assignments/course/{courseId}': {
        get: {
          tags: ['Assignments'],
          summary: 'Get assignments for a course',
          description: 'Returns a list of assignments for a specific course',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'courseId',
              in: 'path',
              required: true,
              description: 'ID of the course',
              schema: {
                type: 'string'
              }
            },
            {
              name: 'status',
              in: 'query',
              description: 'Filter assignments by status',
              required: false,
              schema: {
                type: 'string',
                enum: ['draft', 'published', 'closed']
              }
            }
          ],
          responses: {
            '200': {
              description: 'A list of assignments',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Assignment'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - Not authorized to view assignments for this course'
            },
            '404': {
              description: 'Course not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/assignments/{id}': {
        get: {
          tags: ['Assignments'],
          summary: 'Get assignment by ID',
          description: 'Returns a single assignment by ID',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the assignment to retrieve',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Assignment found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Assignment'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - Not authorized to view this assignment'
            },
            '404': {
              description: 'Assignment not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        },
        put: {
          tags: ['Assignments'],
          summary: 'Update an assignment',
          description: 'Update an existing assignment by ID',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the assignment to update',
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Assignment'
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Assignment updated successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Assignment'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input or assignment has submissions'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the assignment'
            },
            '404': {
              description: 'Assignment not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        },
        delete: {
          tags: ['Assignments'],
          summary: 'Delete an assignment',
          description: 'Delete an assignment by ID',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the assignment to delete',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Assignment deleted successfully'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the assignment'
            },
            '404': {
              description: 'Assignment not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/assignments/{id}/publish': {
        put: {
          tags: ['Assignments'],
          summary: 'Publish an assignment',
          description: 'Change the status of an assignment to published',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the assignment to publish',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Assignment published successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Assignment'
                  }
                }
              }
            },
            '400': {
              description: 'Assignment is already published or has no questions'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the assignment'
            },
            '404': {
              description: 'Assignment not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/assignments/{id}/submissions': {
        get: {
          tags: ['Assignments'],
          summary: 'Get assignment submissions',
          description: 'Returns all submissions for a specific assignment',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the assignment',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'A list of submissions',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Submission'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the assignment'
            },
            '404': {
              description: 'Assignment not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/submissions/assignment/{assignmentId}/submit': {
        post: {
          tags: ['Submissions'],
          summary: 'Submit an assignment',
          description: 'Submit answers for an assignment',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'assignmentId',
              in: 'path',
              required: true,
              description: 'ID of the assignment to submit',
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mcqAnswers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          questionId: {
                            type: 'string'
                          },
                          selectedAnswer: {
                            type: 'integer'
                          }
                        }
                      }
                    },
                    essayAnswers: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          questionId: {
                            type: 'string'
                          },
                          answer: {
                            type: 'string'
                          }
                        }
                      }
                    },
                    content: {
                      type: 'string',
                      description: 'General submission content'
                    },
                    attachmentUrl: {
                      type: 'string',
                      format: 'uri'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Assignment submitted successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Submission'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input, deadline passed, or assignment not available'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not a student or not enrolled'
            },
            '404': {
              description: 'Assignment not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/submissions/my': {
        get: {
          tags: ['Submissions'],
          summary: 'Get my submissions',
          description: 'Returns all submissions made by the authenticated student',
          security: [{
            bearerAuth: []
          }],
          responses: {
            '200': {
              description: 'A list of submissions',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/Submission'
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not a student'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/submissions/{id}': {
        get: {
          tags: ['Submissions'],
          summary: 'Get submission by ID',
          description: 'Returns a single submission by ID',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the submission to retrieve',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Submission found',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Submission'
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - Not authorized to view this submission'
            },
            '404': {
              description: 'Submission not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        },
        put: {
          tags: ['Submissions'],
          summary: 'Grade a submission',
          description: 'Grade and provide feedback on a submission',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID of the submission to grade',
              schema: {
                type: 'string'
              }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    score: {
                      type: 'integer',
                      description: 'Total score awarded'
                    },
                    feedback: {
                      type: 'string',
                      description: 'General feedback on the submission'
                    },
                    essayGrades: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          questionId: {
                            type: 'string'
                          },
                          points: {
                            type: 'integer'
                          },
                          feedback: {
                            type: 'string'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Submission graded successfully',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Submission'
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input'
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the assignment'
            },
            '404': {
              description: 'Submission not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      '/submissions/assignment/{assignmentId}/stats': {
        get: {
          tags: ['Submissions'],
          summary: 'Get assignment statistics',
          description: 'Returns statistics for a specific assignment',
          security: [{
            bearerAuth: []
          }],
          parameters: [
            {
              name: 'assignmentId',
              in: 'path',
              required: true,
              description: 'ID of the assignment',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            '200': {
              description: 'Assignment statistics',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      totalSubmissions: {
                        type: 'integer',
                        description: 'Total number of submissions'
                      },
                      gradedSubmissions: {
                        type: 'integer',
                        description: 'Number of graded submissions'
                      },
                      averageScore: {
                        type: 'number',
                        description: 'Average score across all submissions'
                      },
                      maxScore: {
                        type: 'integer',
                        description: 'Maximum possible score'
                      }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized - No token provided or invalid token'
            },
            '403': {
              description: 'Forbidden - User is not the owner of the assignment'
            },
            '404': {
              description: 'Assignment not found'
            },
            '500': {
              description: 'Server error'
            }
          }
        }
      },
      post: {
        tags: ['Courses'],
        summary: 'Create a new course',
        description: 'Create a new course with the provided data',
        security: [{
          bearerAuth: []
        }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Course'
              }
            }
          }
        },
        responses: {
          '201': {
            description: 'Course created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Course'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input data'
          },
          '401': {
            description: 'Unauthorized - No token provided or invalid token'
          },
          '403': {
            description: 'Forbidden - User is not a teacher'
          },
          '500': {
            description: 'Server error'
          }
        }
      }
    },
    '/courses/{id}': {
      get: {
        tags: ['Courses'],
        summary: 'Get course by ID',
        description: 'Returns a single course by ID',
        security: [{
          bearerAuth: []
        }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the course to retrieve',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Course found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Course'
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - No token provided or invalid token'
          },
          '404': {
            description: 'Course not found'
          },
          '500': {
            description: 'Server error'
          }
        }
      },
      put: {
        tags: ['Courses'],
        summary: 'Update a course',
        description: 'Update an existing course by ID',
        security: [{
          bearerAuth: []
        }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the course to update',
            schema: {
              type: 'string'
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Course'
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Course updated successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Course'
                }
              }
            }
          },
          '400': {
            description: 'Invalid input'
          },
          '401': {
            description: 'Unauthorized - No token provided or invalid token'
          },
          '403': {
            description: 'Forbidden - User is not the owner of the course'
          },
          '404': {
            description: 'Course not found'
          },
          '500': {
            description: 'Server error'
          }
        }
      },
      delete: {
        tags: ['Courses'],
        summary: 'Delete a course',
        description: 'Delete a course by ID',
        security: [{
          bearerAuth: []
        }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the course to delete',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '204': {
            description: 'Course deleted successfully'
          },
          '401': {
            description: 'Unauthorized - No token provided or invalid token'
          },
          '403': {
            description: 'Forbidden - User is not the owner of the course'
          },
          '404': {
            description: 'Course not found'
          },
          '500': {
            description: 'Server error'
          }
        }
      }
    },
    '/courses/my-courses': {
      get: {
        tags: ['Courses'],
        summary: 'Get enrolled courses for the current student',
        description: 'Returns a list of courses the authenticated student is enrolled in',
        security: [{
          bearerAuth: []
        }],
        responses: {
          '200': {
            description: 'A list of enrolled courses',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    count: {
                      type: 'integer',
                      description: 'Number of enrolled courses'
                    },
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Course'
                      }
                    }
                  }
                }
              }
            }
          },
          '401': {
            description: 'Unauthorized - No token provided or invalid token'
          },
          '500': {
            description: 'Server error'
          }
        }
      }
    },
    '/courses/{id}/enroll': {
      post: {
        tags: ['Courses'],
        summary: 'Enroll in a course',
        description: 'Enrolls the authenticated student in a specific course',
        security: [{
          bearerAuth: []
        }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the course to enroll in',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Successfully enrolled in the course',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                      example: true
                    },
                    data: {
                      $ref: '#/components/schemas/Course'
                    }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Bad request - Student is already enrolled or course not found'
          },
          '401': {
            description: 'Unauthorized - No token provided or invalid token'
          },
          '403': {
            description: 'Forbidden - User is not a student'
          },
          '404': {
            description: 'Course not found'
          },
          '500': {
            description: 'Server error'
          }
        }
      }
    },
    '/courses/{id}/publish': {
      patch: {
        tags: ['Courses'],
        summary: 'Publish a course',
        description: 'Change the status of a course to published',
        security: [{
          bearerAuth: []
        }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the course to publish',
            schema: {
              type: 'string'
            }
          }
        ],
        responses: {
          '200': {
            description: 'Course published successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Course'
                }
              }
            }
          },
          '400': {
            description: 'Course is already published or invalid status change'
          },
          '401': {
            description: 'Unauthorized - No token provided or invalid token'
          },
          '403': {
            description: 'Forbidden - User is not the owner of the course'
          },
          '404': {
            description: 'Course not found'
          },
          '500': {
            description: 'Server error'
          }
        }
      }
    }
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

export const specs = swaggerJsdoc(options);