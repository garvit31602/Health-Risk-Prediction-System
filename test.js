import { Client } from "@gradio/client";
	
	const client = await Client.connect("garvit31602/health_risk_predictor");
	const result = await client.predict("/predict", { 		
			BMI: 70, 
								
			Smoking: "Yes", 
								
			AlcoholDrinking: "Yes", 
								
			Stroke: "Yes", 
								
			PhysicalHealth: 28, 
								
			MentalHealth: 5, 
								
			DiffWalking: "Yes", 
								
			Sex: "Male", 
								
			AgeCategory: "80 or older", 
								
			Race: "Asian", 
								
			Diabetic: "No", 
								
			PhysicalActivity: "No", 
								
			GenHealth: "Poor", 
								
			SleepTime: 0, 
								
			Asthma: "Yes", 
								
			KidneyDisease: "No", 
								
			SkinCancer: "Yes", 
						
	});

	console.log(result.data);
