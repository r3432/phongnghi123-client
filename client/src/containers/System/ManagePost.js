import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as actions from '../../store/actions';

import { Button, UpdatePost } from '../../components';
import moment from 'moment';
import { apiDeletePost } from '../../services';
import Swal from 'sweetalert2';

const ManagePost = () => {
  const dispatch = useDispatch();
  const [isEdit,setIsEdit]=useState(false)
  const { postOfCurrent, dataEdit } = useSelector(state => state.post);
  const [updateData, setUpdateData]=useState(false)
  const [posts, setPosts]=useState([])
  const [status,setStatus]= useState('')

  useEffect(() => {
   !dataEdit && dispatch(actions.getPostsLimitAdmin());
  }, [dataEdit, updateData]);

  useEffect(() =>{
    setPosts(postOfCurrent)
  },[postOfCurrent])

  useEffect(() => {
    !dataEdit && setIsEdit(false)
  },[dataEdit])

const checkStatus = (dateString) => {
    return moment(dateString, "DD/MM/YYYY").isSameOrAfter(new Date());
};

  // console.log(checkStatus('8/1/2024'));
  // console.log(postOfCurrent);

  

  const handleDeletePost = async(postId) =>{
 
    const response= await apiDeletePost(postId)
    if(response?.data.error === 0){
      
      setUpdateData(prev => !prev)
      
      Swal.fire('Thành công!', 'Xóa tin đăng thành công', 'success'); // Thông báo thành công
    }else {
      // Swal.fire('Oops!', 'Xóa tin đăng thất bại ', 'error')
      Swal.fire('Thành công!', 'Xóa tin đăng thành công', 'success');
    }
  }


  const handleFilterByStatus = (statusCode) =>{
    if(statusCode === 1){
      const activePost=postOfCurrent?.filter(item => checkStatus(item?.overviews?.expired?.split(' ')[3] ))
      setPosts(activePost)
    }else if (statusCode === 0){
      const expiredPost=postOfCurrent?.filter(item => !checkStatus(item?.overviews?.expired?.split(' ')[3] ))
      setPosts(expiredPost)
    }
    else {
      setPosts(postOfCurrent)
    }

    
  }


  
  return (
    <div className='flex flex-col gap-6 '>
      <div className='py-4 border-b border-gray-200 flex items-center justify-between'>
        <h1 className='text-3xl font-medium'>Quản lý bài đăng</h1>
        <select onChange={e => handleFilterByStatus(+e.target.value)} value={status} className='outline-none border p-2 border-gray-200 rounded-md'>
          <option value=''>Lọc theo trạng thái</option>
          <option value='1'>Đang hoạt động</option>
          <option value='0'>Đã hết hạn</option>
        </select>
      </div>

      <table className="w-full table-auto">
        <thead>
          <tr>
            <th className='border p-2'>Mã tin</th>
            <th className='border p-2'>Ảnh đại diện</th>
            <th className='border p-2'>Tiêu đề</th>
            <th className='border p-2'>Giá</th>
            <th className='border p-2'>Ngày bắt đầu</th>
            <th className='border p-2'>Ngày hết hạn</th>
            <th className='border p-2'>Trạng thái</th>
            <th className='border p-2'>Tùy chọn</th>
          </tr>
        </thead>
        <tbody>
          {posts && posts.length > 0 ? (
            posts.map(item => (
              <tr key={item.id}>
                <td className='border text-center p-2'>{item?.overviews?.code}</td>
                <td className='border p-2'>
                  <img
                    src={JSON.parse(item?.images?.image)[0] || ''}
                    alt='avater post'
                    className='w-10 h-10 object-cover rounded-md'
                  />
                </td>
                <td className='border p-2'>{item?.title.slice(0, 50)}...</td>
                <td className='border p-2'>{item?.attributes?.price}</td>
                <td className='border p-2'>{item?.overviews?.created}</td>
                <td className='border p-2'>{item?.overviews?.expired}</td>
                {/* <td className='border p-2'>{item?.status || 'Chưa xác định'}</td> */}
                <td className='border p-2'>{checkStatus(item?.overviews?.expired?.split(' ')[3] ) ? 'Đang hoạt động' :  'Đã hết hạn'}</td>

                <td className='border py-2 px-2 flex-1 h-full flex items-center justify-center gap-4'>
                 <Button
                 text='Sửa'
                 bgColor='bg-green-600'
                 textColor='text-white'
                 onClick={()=> {
                  dispatch(actions.editData(item))
                  setIsEdit(true)
                 }}
                 />

<Button
                 text='Xóa'
                 bgColor='bg-orange-600'
                 textColor='text-white'
                 onClick={() => handleDeletePost(item.id)}
                 />


                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className='border text-center p-2'>Không có bài đăng nào.</td>
            </tr>
          )}
        </tbody>
      </table>
      {isEdit && <UpdatePost  setIsEdit={setIsEdit}/> }
    </div>
  );
};

export default ManagePost;
