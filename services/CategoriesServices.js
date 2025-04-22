import { PrismaClient } from '@prisma/client';
const prismaClient = new PrismaClient();

export const createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required for creating a category' });
  }

  const lowerCaseCategoryName = name.toLowerCase();

  try {
    const category = await prismaClient.category.create({
      data: { name: lowerCaseCategoryName },
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Error creating category', message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await prismaClient.category.findMany();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

export const editCategory = async (req, res) => {
  const id = req.params.id; // ID is now a String (ObjectId)
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required for updating a category' });
  }

  const lowerCaseCategoryName = name.toLowerCase();

  try {
    const updatedCategory = await prismaClient.category.update({
      where: { id: id }, // Use the string ID directly
      data: { name: lowerCaseCategoryName },
    });
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Error updating category', message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params; // ID is now a String (ObjectId)

  try {
    await prismaClient.category.delete({ where: { id: id } }); // Use the string ID directly
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Error deleting category' });
  }
};