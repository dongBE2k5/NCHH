 const saveForm = async (formName) => {
  try {
    const data = {
        name: formName,
      };
    const res = await fetch(`http://localhost:8000/api/create-form`, {
      
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });


    if (!res.ok) throw new Error("Lỗi khi lưu form");
  } catch (error) {
    console.error("Lỗi khi cập nhật giao diện:", error);
  }

};

 const deleteForm = async (formID) => {
    try {
    
      const res = await fetch(`http://localhost:8000/api/forms/${formID}`, {
        
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
       
      });
  
  
      if (!res.ok) throw new Error("Lỗi khi xóa form");
    } catch (error) {
      console.error("Lỗi khi cập nhật giao diện:", error);
    }
  
  };

  const updateForm = async (formID, formName) => {
    try {
      const data = {
          name: formName, 
        };
      const res = await fetch(`http://localhost:8000/api/forms/${formID}`, {
        
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
  
  
      if (!res.ok) throw new Error("Lỗi khi cập nhật form");
    } catch (error) {
      console.error("Lỗi khi cập nhật giao diện:", error);
    }
  
  };

  export {
    saveForm,
    deleteForm,
    updateForm,
  }
