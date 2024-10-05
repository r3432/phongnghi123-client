import React, { useEffect, useState } from 'react'
import { Overview, Address, Loading, Button, UpdatePost } from '../../components'
import { apiUploadImages } from '../../services'
import icons from '../../ultils/icons'
import { getCodes, getCodesArea } from '../../ultils/Common/getCodes'
import { useSelector } from 'react-redux'
import { apiCreatePost ,apiUpdatePost} from '../../services'
import Swal from 'sweetalert2'
import validate from '../../ultils/Common/validateFields'
import { useDispatch } from 'react-redux'
import { resetDataEdit } from '../../store/actions'

const { BsCameraFill, ImBin } = icons

const CreatePost = ({isEdit }) => {

   
 
    const { dataEdit } = useSelector(state => state.post);

    const dispatch = useDispatch();
    
    const [payload, setPayload]=useState(() => {
     
           const initData = {
            categoryCode: dataEdit?.categoryCode || '',
            title: dataEdit?.title || '',
            priceNumber: dataEdit?.priceNumber * 1000000|| 0,
            areaNumber: dataEdit?.areaNumber || 0,
            images:dataEdit?.images?.image ?  JSON.parse(dataEdit?.images?.image) : '',

      
            address: dataEdit?.address || '',
            priceCode: dataEdit?.priceCode || '',
            areaCode: dataEdit?.areaCode || '',
            description:dataEdit?.description ? JSON.parse(dataEdit?.description ) : '',
            target: dataEdit?.overviews?.target || '',
            province: dataEdit?.province || ''
           
        }
      
    return initData
    
    })
    console.log(dataEdit)
    const [imagesPreview, setImagesPreview] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const { prices, areas , categories, provinces} = useSelector(state => state.app)
    const {currentData} = useSelector(state =>state.user)
    const [invalidFields, setInvalidFields ]=useState([])


    
    useEffect(() => {
        if (dataEdit) {
            let images = JSON.parse(dataEdit?.images?.image);

            images && setImagesPreview(images)
        }
    }, [dataEdit]);
    
    
    const handleFiles = async (e) => {
        e.stopPropagation()
        setIsLoading(true)
        let images = []
        let files = e.target.files
        let formData = new FormData()
        for (let i of files) {
            formData.append('file', i)

            formData.append('upload_preset', 'mxy7pgvk');

            // formData.append('upload_preset', process.env.REACT_APP_UPLOAD_ASSETS_NAME)
            let response = await apiUploadImages(formData)
            if (response.status === 200) images = [...images, response.data?.secure_url]
        }
        setIsLoading(false)
        setImagesPreview(prev => [...prev, ...images])
        setPayload(prev => ({ ...prev, images: [...prev.images, ...images] }))
    }
    const handleDeleteImage = (image) => {
        setImagesPreview(prev => prev?.filter(item => item !== image))
        setPayload(prev => ({
            ...prev,
            images: prev.images?.filter(item => item !== image)

            
        }))
        setPayload(prev => ({ ...prev, images: prev.images.filter(item => item !== image) }));
    }
    const handleSubmit = async () => {
        // let priceCodeArr = getCodes(+payload.priceNumber / Math.pow(10, 6), prices, 1, 15);
        // let priceCode = priceCodeArr[0]?.code;
        // let areaCodeArr = getCodesArea(+payload.areaNumber, areas, 0, 90);
        // let areaCode = areaCodeArr[0]?.code;

        let priceCodeArr = getCodes(payload.priceNumber / Math.pow(10, 6), prices);
        let priceCode = priceCodeArr.length > 0 ? priceCodeArr[0]?.code : 'Mã mặc định'; // Gán mã mặc định nếu không tìm thấy
    
        let areaCodeArr = getCodesArea(payload.areaNumber, areas);
        let areaCode = areaCodeArr.length > 0 ? areaCodeArr[0]?.code : 'Mã mặc định'; // Gán mã mặc định nếu không tìm thấy
    
        let finalPayload = {
            ...payload,
            priceCode,
            areaCode,
            userId: currentData.id,
            priceNumber: +payload.priceNumber / Math.pow(10, 6),
            target: payload.target || 'Tat ca',
            label: `${categories?.find(item => item.code === payload?.categoryCode)?.value} ${payload?.address?.split(',')[0]}`,
            images: imagesPreview // Đảm bảo cập nhật hình ảnh
        };
    
        console.log('finalPayload:', finalPayload); // Debugging
    
        const result = validate(finalPayload, setInvalidFields);
        if (result !== 0) {
            console.log('Có lỗi trong form', invalidFields);
            return; // Ngừng thực hiện nếu có lỗi
        }
    
        try {
            let response;
            if (dataEdit && isEdit) {
                finalPayload.postId = dataEdit?.id;
                finalPayload.attributesId = dataEdit?.attributesId;
                finalPayload.imagesId = dataEdit?.imagesId;
                finalPayload.overviewId = dataEdit?.overviewId;
                
                response = await apiUpdatePost(finalPayload);
    
                if (response?.data.err === 0) {
                    Swal.fire('Thành công', 'Cập nhật thành công', 'success').then(() => {
                        resetPayload();
                        dispatch(resetDataEdit());
                    });
                } else {
                    Swal.fire('Thất bại', 'Có lỗi gì đó', 'error');
                }
            } else {
                response = await apiCreatePost(finalPayload);
                if (response?.data.err === 0) {
                    Swal.fire('Thành công', 'Đã thêm bài đăng mới', 'success').then(() => {
                        resetPayload();
                    });
                } else {
                    console.error('API response error:', response.data); // In ra lỗi
                    Swal.fire('Thất bại', 'Có lỗi gì đó', 'error');
                }
            }
        } catch (error) {
            console.error('Có lỗi xảy ra:', error);
            Swal.fire('Thất bại', 'Có lỗi gì đó', 'error');
        }
    };
    
 const resetPayload = () =>{
    setPayload({
        categoryCode: '',
        title: '',
        priceNumber: 0,
        areaNumber: 0,
        images: [],
        address: '',
        priceCode: '',
        areaCode: '',
        description: '',
        target: '',
        province: ''
    });
 }
    return (
        <div className='px-6'>
            <h1 className='text-3xl font-medium py-4 border-b border-gray-200'>{isEdit ? 'Chỉnh sửa tin đăng' : 'Đăng tin mới'}</h1>
            <div className='flex gap-4'>
                <div className='py-4 flex flex-col gap-8 flex-auto'>
                    <Address 
                    // invalidFields={invalidFields} setInvalidFields={setInvalidFields} 
                    payload={payload} setPayload={setPayload} />
                    <Overview 
                    // invalidFields={invalidFields} setInvalidFields={setInvalidFields}
                     payload={payload} setPayload={setPayload} />
                    <div className='w-full mb-6'>
                        <h2 className='font-semibold text-xl py-4'>Hình ảnh</h2>
                        <small>Cập nhật hình ảnh rõ ràng sẽ cho thuê nhanh hơn</small>
                        <div className='w-full'>
                            <label className='w-full border-2 h-[200px] my-4 gap-4 flex flex-col items-center justify-center border-gray-400 border-dashed rounded-md' htmlFor="file">
                                {isLoading
                                    ? <Loading />
                                    : <div className='flex flex-col items-center justify-center'>
                                        <BsCameraFill color='blue' size={50} />
                                        Thêm ảnh
                                    </div>}
                            </label>
                            <input onChange={handleFiles} value='' hidden type="file" id='file' multiple />
                            <div className='w-full'>
                                <h3 className='font-medium py-4'>Ảnh đã chọn</h3>
                                <div className='flex gap-4 items-center'>
                                    {imagesPreview?.map(item => {
                                        return (
                                            <div key={item} className='relative w-1/3 h-1/3 '>
                                                <img src={item} alt="preview" className='w-full h-full object-cover rounded-md' />
                                                <span
                                                    title='Xóa'
                                                    onClick={() => handleDeleteImage(item)}
                                                    className='absolute top-0 right-0 p-2 cursor-pointer bg-gray-300 hover:bg-gray-400 rounded-full'
                                                >
                                                    <ImBin />
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                    <Button onClick={handleSubmit} text={ isEdit? 'Cập nhật' :'Tạo mới' }bgColor='bg-green-600' textColor='text-white' />
                    <div className='h-[500px]'>

                    </div>
                </div>
                <div className='w-[30%] flex-none'>
                    maps
                    <Loading />
                </div>
            </div>
        </div>
    )
}

export default CreatePost