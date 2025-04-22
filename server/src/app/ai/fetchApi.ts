export async function query(data:any) {
	const response = await fetch(
		"https://router.huggingface.co/hf-inference/models/Qwen/QwQ-32B",
		{
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
	const result = await response.json();
	return result;
}

