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
   <button className="bg-emerald-400 rounded-xl hover:cursor-pointer m-4 fixed left-0 top-0 flex items-center hover:brightness-105 px-3 py-3" onClick={bakctohome}>
       <IoIosArrowBack/>Home</button>
  )
}
