import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom"

export default function BackButton() {
 const navigate = useNavigate();
 function bakctohome() {
  const name = localStorage.getItem('userName');
  localStorage.clear();
  localStorage.setItem('userName',name);
  navigate("/");
  window.location.reload();
 }
  return (
   <button className="bg-emerald-400 rounded-3xl hover:cursor-pointer p-3 m-4 fixed left-0 top-0 flex items-center z-50 hover:brightness-105" onClick={bakctohome}>
       <IoIosArrowBack className="mx-2"/> Back to Home</button>
  )
}
