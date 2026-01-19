import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function JobDetailsPage() {
  const { id } = useRouter().query;

  const [job, setJob] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [cylinders, setCylinders] = useState([]);
  const [images, setImages] = useState([]);

  const [newMaterial, setNewMaterial] = useState("");
  const [cylinderNo, setCylinderNo] = useState("");
  const [colour, setColour] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      supabase.from("jobs").select("*").eq("id", id).single().then(r => setJob(r.data));
      supabase.from("job_materials").select("*").eq("job_id", id).then(r => setMaterials(r.data || []));
      supabase.from("cylinders").select("*").eq("job_id", id).then(r => setCylinders(r.data || []));
      supabase.from("job_images").select("*").eq("job_id", id).then(r => setImages(r.data || []));
    }
  }, [id]);

  async function addMaterial(e) {
    e.preventDefault();
    await supabase.from("job_materials").insert({ job_id: id, material: newMaterial });
    setNewMaterial("");
    const { data } = await supabase.from("job_materials").select("*").eq("job_id", id);
    setMaterials(data);
  }

  async function addCylinder(e) {
    e.preventDefault();
    await supabase.from("cylinders").insert({
