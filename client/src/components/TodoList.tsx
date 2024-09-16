import { Button, Flex, Input, Spinner, Stack, Text } from "@chakra-ui/react";
import { IoMdAdd } from "react-icons/io";
import TodoItem from "./TodoItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BASE_URL } from "../App";

export type Todo = {
  _id: number;
  body: string;
  completed: boolean;
};

const TodoList = () => {
  const [inputValue, setInputValue] = useState("");  // Estado para o valor da entrada
  const queryClient = useQueryClient();

  // Query para buscar os todos
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await fetch(BASE_URL + "/todos");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }
      return data || [];
    },
  });

  // Mutação para criar um novo todo
  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationKey: ["createTodo"],
    mutationFn: async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const res = await fetch(BASE_URL + "/todos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ body: inputValue }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        setInputValue("");
        return data;
      } catch (error: any) {
        throw new Error(error);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
    onError: (error: any) => {
      alert(error.message);
    },
  });

  // Filtrar as tarefas com base no valor da entrada
  const filteredTodos = todos?.filter((todo) =>
    todo.body.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Verifica se o valor da entrada deve ser tratado como uma nova tarefa ou uma busca
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== "" && !todos?.some(todo => todo.body.toLowerCase() === inputValue.toLowerCase())) {
      createTodo(e);
    }
  };

  return (
    <>
      <form onSubmit={handleFormSubmit}>
        <Flex gap={2} mb={4}>
          <Input
            type="text"
            placeholder="Add a new task/Search tasks..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            mx={2}
            type="submit"
            _active={{
              transform: "scale(.97)",
            }}
          >
            {isCreating ? <Spinner size={"xs"} /> : <IoMdAdd size={30} />}
          </Button>
        </Flex>
      </form>

      <Text
        fontSize={"4xl"}
        textTransform={"uppercase"}
        fontWeight={"bold"}
        textAlign={"center"}
        my={2}
        bgColor="#29B3FF"
        bgClip="text"
      >
        Your Tasks
      </Text>

      {isLoading && (
        <Flex justifyContent={"center"} my={4}>
          <Spinner size={"xl"} />
        </Flex>
      )}

      {!isLoading && filteredTodos?.length === 0 && (
        <Stack alignItems={"center"} gap="3">
          <Text fontSize={"xl"} textAlign={"center"} color={"#29B3FF"}>
            Try creating another task!!
          </Text>
          <img src="/checkTask.png" alt="No tasks" width={70} height={70} />
        </Stack>
      )}

      <Stack gap={3}>
        {filteredTodos?.map((todo) => (
          <TodoItem key={todo._id} todo={todo} />
        ))}
      </Stack>
    </>
  );
};

export default TodoList;
