import styles from './Post.module.scss';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Form } from '../../types/Form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';
import AddComment from '../../components/AddComment/AddComment';
import dateFormat from '../../components/Time';
import Comments from '../../components/Comments/Comments';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Comment as CommentType } from '../../types/Comment';

function Post() {

  const initFormValues = {
    title: '',
    image_link: '',
    content: ''
  }

  const { id } = useParams();
  const [showEdit, setShowEdit] = useState(false);
  const [formValues, setFormValues] = useState(initFormValues);

  const { isLoading : postDataLoading, isError: postDataError, data: postData } = useQuery({
    queryKey: ["postData"],
    queryFn: () =>
    axios.get(`http://localhost:3004/posts/${id}`)
    .then(({ data }) => data[0] )
  })

  const { isLoading, error, data: comments } = useQuery({
    queryKey: ["comments"],
    queryFn: () =>
    axios.get(`http://localhost:3004/comments/${id}`)
    .then(({ data }) => {
      if (data && data.length) {
        return data;
      } else {
        return null;
      }
    })
  })

  useEffect(() => {
    if (!postDataLoading && !postDataError) {
      setFormValues({image_link: postData.image_link, title: postData.title, content: postData.content})
    }
  }, [postData])

  const mutationEditPost = useMutation({
    mutationFn: ({title, image_link, content}: Form) => axios.post(`http://localhost:3004/posts/${id}`, {title, image_link, content}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postData'] });
      setShowEdit(!showEdit);
      toast.success('Post edited!');
      setFormValues(initFormValues);
    },
    onError: () => {
      toast.error('Something went wrong!')
    }
  })

  const editPost = () => {
    return (
    <form className={styles.addForm}
          onSubmit={(e) => {
            e.preventDefault();
            mutationEditPost.mutate(formValues)
          }}
    >
      <h2>Edit post</h2>
      <label>
        Image link:
        <input  type='text'
                value={formValues.image_link}
                onChange={(e) => {setFormValues({...formValues, image_link: e.target.value })}}
        />
      </label>

      <label>
        Title:
        <input  type='text'
                value={formValues.title}
                onChange={(e) => {setFormValues({...formValues, title: e.target.value })}}
        />
      </label>

      <label>
        Content:
        <textarea placeholder='Content...'
                  value={formValues.content}
                  onChange={(e) => {setFormValues({...formValues, content: e.target.value })}}
        />
      </label>

      <button>Submit</button>

    </form>
    ) 
    
  }
  
  const queryClient = useQueryClient()

  type AddComment = {
    comment: string
    author: string
  }
  
  const mutationComment = useMutation({
    mutationFn: ({comment, author}: AddComment) => axios
      .post('http://localhost:3004/comments', {id: uuidv4(), comment, author, date: dateFormat(), post_id: id}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] })
      queryClient.invalidateQueries({ queryKey: ['postData'] })
    }
  })

  const addComment = (author: string, comment: string) => {
    mutationComment.mutate({comment, author})
  }


  if (!postData) {
    return <h1>No data found!</h1>
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.postContainer}>
        <button className={styles.edit_button} 
                onClick={() => setShowEdit(!showEdit)}
        >
          {showEdit ? 'Cancel' : 'Edit post'}
        </button>
        {showEdit ? 
          editPost() :
          <div className={styles.card}>
            <div className={styles.img_container}>
              <img src={postData?.image_link}
                   alt={postData?.title} 
              />
            </div>
            <div className={styles.text_content}>
              <span className={styles.title}>{postData?.title}</span>
              <span className={styles.content}>{postData?.content}</span>
              <span className={styles.date}>{String(postData?.date)}</span>
            </div>
          </div>
        }
      </div>
      <div>
        <h3 className={styles.comment_section_title}>
          Comment section
        </h3>

        <div className={styles.comment_container}>
          {comments && comments.map((comment: CommentType)  => (
            <Comments key= {uuidv4()}
                      author = {comment.author}
                      content = {comment.content}
                      date = {comment.date}
            />
          ))}
        </div>

        {!showEdit && <AddComment addComment={(author, comment) => addComment(author, comment)} />}
      </div>
      
      <ToastContainer />
    </div>
  )
}

export default Post