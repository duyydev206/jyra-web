import { Button } from "antd";
import { BiPointer } from "react-icons/bi";
import { RxText } from "react-icons/rx";
import { AiOutlinePicture } from "react-icons/ai";
import { SlCamrecorder } from "react-icons/sl";
import { FiMusic } from "react-icons/fi";
import { PiExport } from "react-icons/pi";
import { FaRegSquare } from "react-icons/fa";

const EditorToolbar: React.FC = () => {
    return (
        <div className='h-fit w-full bg-white p-3 border flex items-center gap-x-4'>
            <div className='flex items-center'>
                <Button
                    size='large'
                    className='rounded-xs!'
                    icon={<BiPointer className='text-lg' />}
                />
                <Button
                    size='large'
                    className='rounded-xs!'
                    icon={<FaRegSquare className='text-lg' />}
                />
                <Button
                    size='large'
                    className='rounded-xs!'
                    icon={<RxText className='text-lg' />}
                />
                <Button size='large' className='rounded-xs!' icon={null}>
                    <AiOutlinePicture className='text-lg' />
                    <SlCamrecorder className='text-lg' />
                    <FiMusic className='text-lg' />
                </Button>
            </div>
            <Button
                size='large'
                className='rounded-xs!'
                icon={<PiExport className='text-lg' />}
            />
        </div>
    );
};

export default EditorToolbar;
