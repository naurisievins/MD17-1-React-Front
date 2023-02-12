import styles from './Comments.module.scss'
import default_user from '../../assets/images/default_user.png'

type CommentsProps = {
  author: string
  content: string
  date: string
}

function Comments( { author, content, date }: CommentsProps) {

  return (
    <div className={styles.comment}>
      <div className={styles.col}>
        <div className={styles.ico_container}>
          <img src={default_user} alt='Default user icon' />
        </div>
      </div>
      <div className={styles.col}>
        <div className={styles.author}>{author}</div>
        <div className={styles.text}>{content}</div>
        <div className={styles.date}>{date}</div>
    </div>
  </div>
  )
}

export default Comments